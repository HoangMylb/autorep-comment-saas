import { createAdminClient } from "@/backend/lib/supabase";

interface LogFilters {
  status?: "success" | "failed" | "skipped";
  keyword?: string;
  automation?: string;
}

export async function getLogsByUser(userId: string, filters: LogFilters) {
  const supabase = createAdminClient();
  let query = supabase
    .from("comment_logs")
    .select("*, automations(name), facebook_pages(page_name), facebook_posts(message)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.automation) query = query.eq("automation_id", filters.automation);
  if (filters.keyword) query = query.ilike("matched_keyword", `%${filters.keyword}%`);
  if (filters.status) query = query.or(`inbox_status.eq.${filters.status},public_reply_status.eq.${filters.status}`);

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
