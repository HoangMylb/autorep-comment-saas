import { randomUUID } from "crypto";
import { createAutomation, deleteAutomation, findActiveAutomationsByPost, getAllAutomationsForAdmin, getAutomationById, getAutomationsByUser, toggleAutomation, updateAutomation } from "@/backend/repositories/automation.repository";
import { createLog, getAllLogsForAdmin, getLogsByUser } from "@/backend/repositories/comment-log.repository";
import { createDemoPage, getAllPagesForAdmin, getPageById, getPagesByUser } from "@/backend/repositories/facebook-page.repository";
import { createDemoPosts, getAllPostsForAdmin, getPostById, getPostsByPage } from "@/backend/repositories/facebook-post.repository";
import { automationInputSchema, logFiltersSchema, sendTestCommentSchema } from "@/backend/validators/automation-validator";

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
  return getPostsByPage(userId, pageId);
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
  return getAutomationsByUser(userId);
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
  await getAutomationRecord(userId, id);
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
      error_message: null
    });
    return { matched: false, matchedKeyword: null, log };
  }

  const matchedKeyword = matchKeyword(validated.comment_message, matchedAutomation.keywords);
  const log = await createLog({
    ...basePayload,
    automation_id: matchedAutomation.id,
    matched_keyword: matchedKeyword,
    inbox_status: "success",
    public_reply_status: matchedAutomation.public_reply_message ? "success" : "skipped",
    error_message: null
  });

  return { matched: true, matchedKeyword, log, automation: matchedAutomation };
}

export async function getUserLogs(userId: string, filters: unknown) {
  const validated = logFiltersSchema.parse(filters);
  return getLogsByUser(userId, validated);
}

export async function getAdminPages() {
  return getAllPagesForAdmin();
}

export async function getAdminAutomations() {
  return getAllAutomationsForAdmin();
}

export async function getAdminLogs(filters: unknown) {
  const validated = logFiltersSchema.parse(filters);
  return getAllLogsForAdmin(validated);
}

export async function getAdminPosts() {
  return getAllPostsForAdmin();
}
