import { getAllLogsForAdmin, getLogsByUser } from "@/backend/repositories/comment-log.repository";
import { logFiltersSchema } from "@/backend/validators/automation-validator";
import type { CommentLog } from "@/frontend/types/domain";

type NormalizedCommentLog = CommentLog & {
  automations: { name?: string } | null;
  facebook_pages: { page_name?: string } | null;
  facebook_posts: { message?: string | null } | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function normalizeCommentLog(log: Record<string, unknown>): NormalizedCommentLog {
  return {
    ...log,
    automations: unwrapRelation(log.automations as { name?: string } | { name?: string }[] | null | undefined),
    facebook_pages: unwrapRelation(log.facebook_pages as { page_name?: string } | { page_name?: string }[] | null | undefined),
    facebook_posts: unwrapRelation(log.facebook_posts as { message?: string | null } | { message?: string | null }[] | null | undefined)
  } as NormalizedCommentLog;
}

export async function getUserLogs(userId: string, filters: unknown) {
  const validated = logFiltersSchema.parse(filters);
  const logs = await getLogsByUser(userId, validated);
  return logs.map((log) => normalizeCommentLog(log));
}

export async function getAdminLogs(filters: unknown) {
  const validated = logFiltersSchema.parse(filters);
  const logs = await getAllLogsForAdmin(validated);
  return logs.map((log) => normalizeCommentLog(log));
}
