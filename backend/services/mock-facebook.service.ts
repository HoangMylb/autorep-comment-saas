import { randomUUID } from "crypto";
import { createAutomation, deleteAutomation, findActiveAutomationsByPost, getAllAutomationsForAdmin, getAutomationById, getAutomationsByUser, toggleAutomation, updateAutomation, type AutomationRecord } from "@/backend/repositories/automation.repository";
import { createLog, getAllLogsForAdmin, getLogsByUser } from "@/backend/repositories/comment-log.repository";
import { createDemoPage, getAllPagesForAdmin, getPageById, getPagesByUser } from "@/backend/repositories/facebook-page.repository";
import { createDemoPosts, getAllPostsForAdmin, getPostById, getPostsByPage } from "@/backend/repositories/facebook-post.repository";
import { automationInputSchema, logFiltersSchema, sendTestCommentSchema } from "@/backend/validators/automation-validator";
import type { CommentLog } from "@/frontend/types/domain";

function stripVietnamese(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeForMatch(input: string) {
  return stripVietnamese(input).toLowerCase().trim().replace(/\s+/g, " ");
}

function unwrapRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

type NormalizedCommentLog = CommentLog & {
  automations: { name?: string } | null;
  facebook_pages: { page_name?: string } | null;
  facebook_posts: { message?: string | null } | null;
};

function normalizeCommentLog(log: Record<string, unknown>): NormalizedCommentLog {
  return {
    ...log,
    automations: unwrapRelation(log.automations as { name?: string } | { name?: string }[] | null | undefined),
    facebook_pages: unwrapRelation(log.facebook_pages as { page_name?: string } | { page_name?: string }[] | null | undefined),
    facebook_posts: unwrapRelation(log.facebook_posts as { message?: string | null } | { message?: string | null }[] | null | undefined)
  } as NormalizedCommentLog;
}

export function matchKeyword(commentMessage: string, keywords: string[]) {
  const normalizedComment = normalizeForMatch(commentMessage);
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeForMatch(keyword);
    if (normalizedKeyword && normalizedComment.includes(normalizedKeyword)) {
      return keyword;
    }
  }
  return null;
}

function isAutomationStale(automation: AutomationRecord) {
  const pageMissing = !automation.facebook_pages;
  const postMissing = !automation.facebook_posts;
  const pageDisconnected = automation.facebook_pages?.status === "disconnected";
  const postStale = automation.facebook_posts?.is_stale === true;

  return pageMissing || postMissing || pageDisconnected || postStale;
}

export async function createDemoPageWithPosts(userId: string) {
  const page = await createDemoPage(userId);
  const posts = await createDemoPosts(userId, page.id);
  return { page, posts };
}

export async function getUserPages(userId: string) {
  return getPagesByUser(userId);
}

export async function getUserPosts(userId: string, pageId: string) {
  const page = await getPageById(pageId, userId);
  if (!page) throw new Error("Page not found");
  const posts = await getPostsByPage(userId, pageId);
  return posts.map((post) => ({
    ...post,
    facebook_pages: unwrapRelation(post.facebook_pages)
  }));
}

export async function createAutomationRecord(userId: string, input: unknown) {
  const validated = automationInputSchema.parse(input);
  return createAutomation({ ...validated, user_id: userId });
}

export async function getAutomationRecord(userId: string, id: string) {
  const automation = await getAutomationById(id, userId);
  if (!automation) throw new Error("Automation not found");
  return automation;
}

export async function getUserAutomations(userId: string) {
  const automations = await getAutomationsByUser(userId);
  return automations.map((automation) => ({
    ...automation,
    facebook_pages: unwrapRelation(automation.facebook_pages),
    facebook_posts: unwrapRelation(automation.facebook_posts),
    is_stale: isAutomationStale(automation)
  }));
}

export async function updateAutomationRecord(userId: string, id: string, input: unknown) {
  await getAutomationRecord(userId, id);
  const validated = automationInputSchema.parse(input);
  return updateAutomation(id, userId, validated);
}

export async function deleteAutomationRecord(userId: string, id: string) {
  await getAutomationRecord(userId, id);
  return deleteAutomation(id, userId);
}

export async function toggleAutomationRecord(userId: string, id: string) {
  const automation = await getAutomationRecord(userId, id);
  if (automation && isAutomationStale(automation)) {
    throw new Error("Cannot activate automation with missing or stale page/post");
  }
  return toggleAutomation(id, userId);
}

export async function sendTestComment(userId: string, input: unknown) {
  const validated = sendTestCommentSchema.parse(input);
  const post = await getPostById(validated.facebook_post_id, userId);
  if (!post) throw new Error("Post not found");

  const automations = await findActiveAutomationsByPost(userId, validated.facebook_post_id);
  const basePayload = {
    user_id: userId,
    facebook_post_id: post.id,
    facebook_page_id: post.facebook_page_id,
    comment_id: `mock_comment_${randomUUID()}`,
    commenter_id: null,
    commenter_name: validated.commenter_name,
    comment_message: validated.comment_message,
    raw_payload: {
      type: "mock_comment",
      commenter_name: validated.commenter_name,
      comment_message: validated.comment_message,
      facebook_post_id: validated.facebook_post_id
    }
  };

  if (automations.length === 0) {
    const log = await createLog({
      ...basePayload,
      automation_id: null,
      matched_keyword: null,
      inbox_status: "skipped",
      public_reply_status: "skipped",
      source: "simulated_facebook",
      event_type: "test_comment",
      processing_status: "skipped",
      error_message: "No active automation found"
    });
    return { matched: false, matchedKeyword: null, log };
  }

  const matchedAutomation = automations.find((automation) => matchKeyword(validated.comment_message, automation.keywords));

  if (!matchedAutomation) {
    const log = await createLog({
      ...basePayload,
      automation_id: automations[0]?.id ?? null,
      matched_keyword: null,
      inbox_status: "skipped",
      public_reply_status: "skipped",
      source: "simulated_facebook",
      event_type: "test_comment",
      processing_status: "skipped",
      error_message: "No keyword matched"
    });
    return { matched: false, matchedKeyword: null, log };
  }

  const matchedKeyword = matchKeyword(validated.comment_message, matchedAutomation.keywords);
  const log = await createLog({
    ...basePayload,
      automation_id: matchedAutomation.id,
      matched_keyword: matchedKeyword,
      inbox_status: "skipped",
      public_reply_status: "skipped",
      source: "simulated_facebook",
      event_type: "test_comment",
      processing_status: "processed",
      error_message: "Private reply skipped for simulated comment"
    });

  return { matched: true, matchedKeyword, log, automation: matchedAutomation };
}

export async function getUserLogs(userId: string, filters: unknown) {
  const validated = logFiltersSchema.parse(filters);
  const logs = await getLogsByUser(userId, validated);
  return logs.map((log) => normalizeCommentLog(log));
}

export async function getAdminPages() {
  return getAllPagesForAdmin();
}

export async function getAdminAutomations() {
  return getAllAutomationsForAdmin();
}

export async function getAdminLogs(filters: unknown) {
  const validated = logFiltersSchema.parse(filters);
  const logs = await getAllLogsForAdmin(validated);
  return logs.map((log) => normalizeCommentLog(log));
}

export async function getAdminPosts() {
  return getAllPostsForAdmin();
}
