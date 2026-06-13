import { createAdminClient } from "@/backend/lib/supabase";

export async function getPagesByUser(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("facebook_pages").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPageById(id: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("facebook_pages").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllPagesForAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("facebook_pages").select("*, profiles(email, full_name)").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPageByFacebookPageId(pageId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("facebook_pages").select("*").eq("page_id", pageId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertFacebookPages(
  userId: string,
  pages: Array<{
    page_id: string;
    page_name: string;
    page_avatar_url: string | null;
    page_access_token: string | null;
    user_access_token: string | null;
    token_expires_at: string | null;
    permissions: string[];
    status: string;
    error_message: string | null;
  }>
) {
  const supabase = createAdminClient();
  const payload = pages.map((page) => ({
    ...page,
    user_id: userId,
    connection_type: "facebook",
    is_mock: false,
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase.from("facebook_pages").upsert(payload, { onConflict: "user_id,page_id" }).select("*");
  if (error) throw error;
  return data ?? [];
}

export async function updateFacebookPageStatus(pageRecordId: string, userId: string, input: Record<string, unknown>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facebook_pages")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", pageRecordId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function disconnectFacebookPage(pageRecordId: string, userId: string) {
  return updateFacebookPageStatus(pageRecordId, userId, {
    status: "disconnected",
    user_access_token: null,
    page_access_token: null,
    token_expires_at: null,
    permissions: [],
    webhook_subscribed: false,
    webhook_subscribed_at: null,
    error_message: null
  });
}

export async function deleteFacebookPage(pageRecordId: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facebook_pages")
    .delete()
    .eq("id", pageRecordId)
    .eq("user_id", userId)
    .select("id");
  if (error) throw error;
  return data ?? [];
}

export async function markFacebookPageWebhookSubscribed(pageRecordId: string, userId: string) {
  return updateFacebookPageStatus(pageRecordId, userId, {
    webhook_subscribed: true,
    webhook_subscribed_at: new Date().toISOString(),
    error_message: null
  });
}
