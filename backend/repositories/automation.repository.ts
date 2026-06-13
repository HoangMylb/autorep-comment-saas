import { createAdminClient } from "@/backend/lib/supabase";

export interface AutomationRecord {
  id: string;
  user_id: string;
  facebook_page_id: string;
  facebook_post_id: string;
  name: string;
  keywords: string[];
  inbox_message: string;
  public_reply_message: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  facebook_pages?: { page_name?: string | null; status?: string | null } | null;
  facebook_posts?: { id?: string; message?: string | null; post_id?: string | null; is_stale?: boolean | null } | null;
}

export async function getAutomationsByUser(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*, facebook_pages(page_name, status), facebook_posts(message, post_id, is_stale)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AutomationRecord[];
}

export async function getAutomationById(id: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*, facebook_pages(page_name, status), facebook_posts(message, post_id, is_stale)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as AutomationRecord | null;
}

export async function createAutomation(input: Record<string, unknown>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("automations").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateAutomation(id: string, userId: string, input: Record<string, unknown>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("automations").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteAutomation(id: string, userId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("automations").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function toggleAutomation(id: string, userId: string) {
  const current = await getAutomationById(id, userId);
  if (!current) throw new Error("Automation not found");
  return updateAutomation(id, userId, { is_active: !current.is_active });
}

export async function findActiveAutomationsByPost(userId: string, postId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("automations").select("*").eq("user_id", userId).eq("facebook_post_id", postId).eq("is_active", true);
  if (error) throw error;
  return (data ?? []) as AutomationRecord[];
}

export async function findActiveAutomationsByPage(userId: string, pageId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*, facebook_posts(id, post_id, message)")
    .eq("user_id", userId)
    .eq("facebook_page_id", pageId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AutomationRecord[];
}

export async function getAutomationsByPageIds(pageRecordId: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .select("id")
    .eq("facebook_page_id", pageRecordId)
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as AutomationRecord[];
}

export async function deleteAutomationsByPage(pageRecordId: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .delete()
    .eq("facebook_page_id", pageRecordId)
    .eq("user_id", userId)
    .select("id");
  if (error) throw error;
  return data ?? [];
}

export async function getAllAutomationsForAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*, facebook_pages(page_name, status), facebook_posts(message, post_id, is_stale), profiles(email, full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAutomationsByPage(userId: string, pageId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("automations").select("*").eq("user_id", userId).eq("facebook_page_id", pageId);
  if (error) throw error;
  return data ?? [];
}

export async function deactivateAutomationsByPage(userId: string, pageId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("facebook_page_id", pageId)
    .select("*");
  if (error) throw error;
  return data ?? [];
}
