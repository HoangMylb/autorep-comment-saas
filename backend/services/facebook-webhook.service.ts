import { findActiveAutomationsByPage, findActiveAutomationsByPost } from "@/backend/repositories/automation.repository";
import { createLog, findSuccessfulLogByCommentAndAutomation } from "@/backend/repositories/comment-log.repository";
import { logFacebookSystemEvent } from "@/backend/lib/facebook-log";
import { getPageByFacebookPageId } from "@/backend/repositories/facebook-page.repository";
import { createPlaceholderFacebookPost, getPostByFacebookPostId } from "@/backend/repositories/facebook-post.repository";
import { getServerEnv } from "@/backend/lib/env";
import { sendPrivateReplyToComment, sendPublicReplyToComment } from "@/backend/services/facebook-message.service";
import { matchKeyword } from "@/backend/services/mock-facebook.service";

interface FacebookCommentEvent {
  pageId: string;
  postId: string;
  commentId: string;
  commenterId: string | null;
  commenterName: string | null;
  commentMessage: string;
  createdTime: string | null;
  rawPayload: Record<string, unknown>;
}

interface FacebookWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    time?: number;
    changes?: Array<{
      field?: string;
      value?: Record<string, unknown>;
    }>;
  }>;
}

function normalizeFacebookObjectId(id?: string | null) {
  if (!id) return "";
  const clean = String(id).trim();
  return clean.includes("_") ? clean.split("_").pop() ?? "" : clean;
}

function extractString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function extractObject(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function extractCommentEvents(payload: FacebookWebhookPayload) {
  const events: FacebookCommentEvent[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const field = change.field;
      const value = change.value ?? {};

      if (field !== "feed" && field !== "comments") {
        continue;
      }

      const item = extractString(value.item);
      const verb = extractString(value.verb);
      if (item !== "comment" || (verb && verb !== "add")) {
        continue;
      }

      const postId = extractString(value.post_id);
      const commentId = extractString(value.comment_id);
      const commentMessage = extractString(value.message);
      const pageId = extractString(value.page_id) ?? extractString(entry.id);
      const from = extractObject(value.from);

      if (!pageId || !postId || !commentId || !commentMessage) {
        continue;
      }

      events.push({
        pageId,
        postId,
        commentId,
        commenterId: extractString(from?.id),
        commenterName: extractString(from?.name),
        commentMessage,
        createdTime: extractString(value.created_time),
        rawPayload: {
          entry,
          change
        }
      });
    }
  }

  return events;
}

async function ensureFacebookPostRecord(userId: string, pageRecordId: string, postId: string, rawPayload: Record<string, unknown>) {
  const existingPost = await getPostByFacebookPostId(postId, pageRecordId);
  if (existingPost) {
    return existingPost;
  }

  return createPlaceholderFacebookPost(userId, pageRecordId, postId, rawPayload);
}

async function createSkippedLog(input: {
  userId: string;
  pageRecordId: string;
  postRecordId: string | null;
  commentId: string;
  commenterId: string | null;
  commenterName: string | null;
  commentMessage: string;
  automationId: string | null;
  matchedKeyword: string | null;
  processingStatus: "skipped" | "failed" | "processed";
  errorMessage: string;
  rawPayload: Record<string, unknown>;
  source?: "facebook" | "simulated_facebook";
  eventType?: string;
}) {
  return createLog({
    user_id: input.userId,
    automation_id: input.automationId,
    facebook_page_id: input.pageRecordId,
    facebook_post_id: input.postRecordId,
    comment_id: input.commentId,
    commenter_id: input.commenterId,
    commenter_name: input.commenterName,
    comment_message: input.commentMessage,
    matched_keyword: input.matchedKeyword,
    inbox_status: "skipped",
    public_reply_status: "skipped",
    source: input.source ?? "facebook",
    event_type: input.eventType ?? "comment",
    processing_status: input.processingStatus,
    error_message: input.errorMessage,
    raw_payload: input.rawPayload
  });
}

async function findMatchingAutomation(input: {
  userId: string;
  pageRecordId: string;
  postRecordId: string;
  webhookPostId: string;
}) {
  const exactAutomations = await findActiveAutomationsByPost(input.userId, input.postRecordId);
  if (exactAutomations.length > 0) {
    return {
      automations: exactAutomations,
      activeAutomationsForPage: [] as Array<Record<string, unknown>>,
      normalizedWebhookPostId: normalizeFacebookObjectId(input.webhookPostId),
      normalizedMatchedPostId: null,
      matchedBy: "exact_post_record"
    };
  }

  const activeAutomationsForPage = await findActiveAutomationsByPage(input.userId, input.pageRecordId);
  const normalizedWebhookPostId = normalizeFacebookObjectId(input.webhookPostId);

  const fallbackMatches = activeAutomationsForPage.filter((automation) => {
    const linkedPost = automation.facebook_posts as { post_id?: string | null } | null | undefined;
    return normalizeFacebookObjectId(linkedPost?.post_id ?? null) === normalizedWebhookPostId;
  });

  const normalizedMatchedPostId = fallbackMatches.length > 0
    ? normalizeFacebookObjectId(
        ((fallbackMatches[0]?.facebook_posts as { post_id?: string | null } | null | undefined)?.post_id ?? null)
      )
    : null;

  return {
    automations: fallbackMatches,
    activeAutomationsForPage,
    normalizedWebhookPostId,
    normalizedMatchedPostId,
    matchedBy: fallbackMatches.length > 0 ? "normalized_post_id_fallback" : "none"
  };
}

export async function processCommentEvent(event: FacebookCommentEvent) {
  const env = getServerEnv();
  const page = await getPageByFacebookPageId(event.pageId);

  if (!page) {
    await logFacebookSystemEvent({
      level: "warning",
      source: "facebook_webhook",
      message: "Facebook webhook page not found",
      metadata: { pageId: event.pageId, commentId: event.commentId }
    });
    return { processed: false, reason: "Page not found" };
  }

  const post = await ensureFacebookPostRecord(page.user_id, page.id, event.postId, event.rawPayload);
  const automationLookup = await findMatchingAutomation({
    userId: page.user_id,
    pageRecordId: page.id,
    postRecordId: post.id,
    webhookPostId: event.postId
  });

  const activeAutomationsForPageMetadata = automationLookup.activeAutomationsForPage.map((automation) => {
    const linkedPost = automation.facebook_posts as { id?: string; post_id?: string | null; message?: string | null } | null | undefined;
    return {
      id: automation.id,
      name: automation.name,
      facebook_page_id: automation.facebook_page_id,
      facebook_post_id: automation.facebook_post_id,
      is_active: automation.is_active,
      keywords: automation.keywords,
      linkedFacebookPost: {
        id: linkedPost?.id ?? null,
        post_id: linkedPost?.post_id ?? null,
        message: linkedPost?.message ?? null
      }
    };
  });

  await logFacebookSystemEvent({
    level: "info",
    source: "facebook_webhook_debug",
    message: "automation lookup debug",
    metadata: {
      webhookPageId: event.pageId,
      webhookPostId: event.postId,
      webhookCommentId: event.commentId,
      commentMessage: event.commentMessage,
      matchedPageDbId: page.id,
      matchedPageExternalId: page.page_id,
      matchedPostDbId: post.id,
      matchedPostExternalId: post.post_id,
      normalizedWebhookPostId: automationLookup.normalizedWebhookPostId,
      normalizedMatchedPostId: automationLookup.normalizedMatchedPostId ?? normalizeFacebookObjectId(post.post_id ?? null),
      automationQueryParams: {
        userId: page.user_id,
        facebook_page_id: page.id,
        facebook_post_id: post.id,
        is_active: true,
        matchedBy: automationLookup.matchedBy
      }
    }
  });

  const automations = automationLookup.automations;

  if (automations.length === 0) {
    await logFacebookSystemEvent({
      level: "warning",
      source: "facebook_webhook_debug",
      message: "No active automation found for matched post",
      metadata: {
        webhookPageId: event.pageId,
        webhookPostId: event.postId,
        webhookCommentId: event.commentId,
        matchedPageDbId: page.id,
        matchedPageExternalId: page.page_id,
        matchedPostDbId: post.id,
        matchedPostExternalId: post.post_id,
        normalizedWebhookPostId: automationLookup.normalizedWebhookPostId,
        normalizedMatchedPostId: automationLookup.normalizedMatchedPostId ?? normalizeFacebookObjectId(post.post_id ?? null),
        activeAutomationsForPage: activeAutomationsForPageMetadata
      }
    });

    await createSkippedLog({
      userId: page.user_id,
      pageRecordId: page.id,
      postRecordId: post.id,
      commentId: event.commentId,
      commenterId: event.commenterId,
      commenterName: event.commenterName,
      commentMessage: event.commentMessage,
      automationId: null,
      matchedKeyword: null,
      processingStatus: "skipped",
      errorMessage: "No active automation found for matched post",
      rawPayload: {
        ...event.rawPayload,
        webhookPostId: event.postId,
        matchedPostDbId: post.id,
        matchedPostExternalId: post.post_id,
        activeAutomationsForPage: activeAutomationsForPageMetadata
      }
    });
    return { processed: false, reason: "No active automation found for matched post" };
  }

  const matchedAutomation = automations.find((automation) => matchKeyword(event.commentMessage, automation.keywords));

  if (!matchedAutomation) {
    await createSkippedLog({
      userId: page.user_id,
      pageRecordId: page.id,
      postRecordId: post.id,
      commentId: event.commentId,
      commenterId: event.commenterId,
      commenterName: event.commenterName,
      commentMessage: event.commentMessage,
      automationId: automations[0]?.id ?? null,
      matchedKeyword: null,
      processingStatus: "skipped",
      errorMessage: "No keyword matched",
      rawPayload: event.rawPayload
    });
    return { processed: false, reason: "No keyword matched" };
  }

  const duplicate = await findSuccessfulLogByCommentAndAutomation(event.commentId, matchedAutomation.id);
  if (duplicate) {
    await createSkippedLog({
      userId: page.user_id,
      pageRecordId: page.id,
      postRecordId: post.id,
      commentId: event.commentId,
      commenterId: event.commenterId,
      commenterName: event.commenterName,
      commentMessage: event.commentMessage,
      automationId: matchedAutomation.id,
      matchedKeyword: null,
      processingStatus: "skipped",
      errorMessage: "Duplicate comment event ignored",
      rawPayload: event.rawPayload
    });
    return { processed: false, reason: "Duplicate comment event ignored" };
  }

  const matchedKeyword = matchKeyword(event.commentMessage, matchedAutomation.keywords);
  const errorMessages = [] as string[];
  const isSimulatedComment = event.commentId.startsWith("test_") || event.commentId.startsWith("mock_");

  const privateReplyResult = isSimulatedComment
    ? {
        success: true,
        status: "skipped" as const,
        errorMessage: "Private reply skipped for simulated comment"
      }
    : await sendPrivateReplyToComment({
        pageAccessToken: page.page_access_token,
        commentId: event.commentId,
        commentMessage: matchedAutomation.inbox_message
      });

  const publicReplyResult = await sendPublicReplyToComment({
    pageAccessToken: page.page_access_token,
    commentId: event.commentId,
    message: matchedAutomation.public_reply_message
  });

  if (privateReplyResult.errorMessage) {
    errorMessages.push(privateReplyResult.errorMessage);
  }

  if (publicReplyResult.errorMessage) {
    errorMessages.push(publicReplyResult.errorMessage);
  }

  const processingStatus =
    privateReplyResult.status === "failed" ||
    privateReplyResult.status === "failed_permission" ||
    publicReplyResult.status === "failed" ||
    publicReplyResult.status === "failed_permission"
      ? "processed_with_errors"
      : "processed";

  const log = await createLog({
    user_id: page.user_id,
    automation_id: matchedAutomation.id,
    facebook_page_id: page.id,
    facebook_post_id: post.id,
    comment_id: event.commentId,
    commenter_id: event.commenterId,
    commenter_name: event.commenterName,
    comment_message: event.commentMessage,
    matched_keyword: matchedKeyword,
    inbox_status: privateReplyResult.status,
    public_reply_status: publicReplyResult.status,
    source: isSimulatedComment ? "simulated_facebook" : "facebook",
    event_type: "comment",
    processing_status: processingStatus,
    error_message: errorMessages.join(" | "),
    raw_payload: event.rawPayload
  });

  return { processed: true, log };
}

export async function handleWebhookPayload(payload: FacebookWebhookPayload) {
  const events = extractCommentEvents(payload);

  if (events.length === 0) {
    await logFacebookSystemEvent({
      level: "info",
      source: "facebook_webhook",
      message: "Unsupported or non-comment Facebook webhook payload received",
      metadata: {
        object: payload.object,
        entryCount: payload.entry?.length ?? 0
      }
    });
    return {
      processed: 0,
      skipped: 0,
      events: 0
    };
  }

  let processed = 0;
  let skipped = 0;

  for (const event of events) {
    const result = await processCommentEvent(event);
    if (result.processed) {
      processed += 1;
    } else {
      skipped += 1;
    }
  }

  await logFacebookSystemEvent({
    level: "info",
    source: "facebook_webhook",
    message: "Facebook webhook payload processed",
    metadata: {
      events: events.length,
      processed,
      skipped
    }
  });

  return {
    processed,
    skipped,
    events: events.length
  };
}
