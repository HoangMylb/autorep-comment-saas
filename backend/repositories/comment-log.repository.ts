import { createAdminClient } from "@/backend/lib/supabase";

interface LogFilters {
  status?: "success" | "failed" | "skipped";
  keyword?: string;
  automation?: string;
  page?: string;
  post?: string;
  source?: string;
  processing?: string;
  limit?: number;
}

export async function getLogsByUser(userId: string, filters: LogFilters) {
  const supabase = createAdminClient();
  let query = supabase
    .from("comment_logs")
    .select("id, user_id, automation_id, facebook_page_id, facebook_post_id, comment_id, commenter_id, commenter_name, comment_message, matched_keyword, inbox_status, public_reply_status, source, event_type, processing_status, error_message, created_at, automations(name), facebook_pages(page_name), facebook_posts(message)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.automation) query = query.eq("automation_id", filters.automation);
  if (filters.page) query = query.eq("facebook_page_id", filters.page);
  if (filters.post) query = query.eq("facebook_post_id", filters.post);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.processing) query = query.eq("processing_status", filters.processing);
  if (filters.keyword) query = query.ilike("matched_keyword", `%${filters.keyword}%`);
  if (filters.status) query = query.or(`inbox_status.eq.${filters.status},public_reply_status.eq.${filters.status}`);
  query = query.limit(filters.limit ?? 50);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createLog(input: Record<string, unknown>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("comment_logs").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteLogsByPage(pageRecordId: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comment_logs")
    .delete()
    .eq("facebook_page_id", pageRecordId)
    .eq("user_id", userId)
    .select("id");
  if (error) throw error;
  return data ?? [];
}

export async function deleteLogsByAutomationIds(automationIds: string[], userId: string) {
  if (automationIds.length === 0) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comment_logs")
    .delete()
    .eq("user_id", userId)
    .in("automation_id", automationIds)
    .select("id");
  if (error) throw error;
  return data ?? [];
}

export async function deleteLogsByPostIds(postIds: string[], userId: string) {
  if (postIds.length === 0) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comment_logs")
    .delete()
    .eq("user_id", userId)
    .in("facebook_post_id", postIds)
    .select("id");
  if (error) throw error;
  return data ?? [];
}

export async function getAllLogsForAdmin(filters: LogFilters) {
  const supabase = createAdminClient();
  let query = supabase
    .from("comment_logs")
    .select("*, automations(name), facebook_pages(page_name), facebook_posts(message), profiles(email, full_name)")
    .order("created_at", { ascending: false });

  if (filters.automation) query = query.eq("automation_id", filters.automation);
  if (filters.keyword) query = query.ilike("matched_keyword", `%${filters.keyword}%`);
  if (filters.status) query = query.or(`inbox_status.eq.${filters.status},public_reply_status.eq.${filters.status}`);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function findSuccessfulLogByCommentAndAutomation(commentId: string, automationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comment_logs")
    .select("*")
    .eq("comment_id", commentId)
    .eq("automation_id", automationId)
    .eq("processing_status", "processed")
    .or("inbox_status.eq.success,public_reply_status.eq.success")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function findSuccessfulInboxLogByCommentAndAutomation(commentId: string, automationId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("comment_logs")
    .select("id")
    .eq("comment_id", commentId)
    .eq("automation_id", automationId)
    .eq("inbox_status", "success")
    .maybeSingle();
  if (error) throw error;
  return data;
}
