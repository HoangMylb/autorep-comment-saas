import { createAdminClient } from "@/backend/lib/supabase";

export async function getPostsByPage(userId: string, pageId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facebook_posts")
    .select("id, user_id, facebook_page_id, post_id, message, permalink_url, created_time, facebook_created_time, last_seen_at, connection_type, is_mock, is_stale, created_at, updated_at, facebook_pages(page_name)")
    .eq("user_id", userId)
    .eq("facebook_page_id", pageId)
    .order("is_stale", { ascending: true })
    .order("last_seen_at", { ascending: false, nullsFirst: false })
    .order("created_time", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPostById(id: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facebook_posts")
    .select("*, facebook_pages(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllPostsForAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("facebook_posts").select("*, facebook_pages(page_name), profiles(email, full_name)").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPostByFacebookPostId(postId: string, pageRecordId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facebook_posts")
    .select("*, facebook_pages(*)")
    .eq("post_id", postId)
    .eq("facebook_page_id", pageRecordId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertFacebookPosts(userId: string, pageRecordId: string, posts: Array<Record<string, unknown>>) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const payload = posts.map((post) => ({
    ...post,
    user_id: userId,
    facebook_page_id: pageRecordId,
    connection_type: "facebook",
    is_mock: false,
    is_stale: false,
    last_seen_at: now,
    updated_at: now
  }));

  const { data, error } = await supabase.from("facebook_posts").upsert(payload, { onConflict: "facebook_page_id,post_id" }).select("*");
  if (error) throw error;
  return data ?? [];
}

export async function markPostsMissingFromSyncAsStale(userId: string, pageRecordId: string, activePostIds: string[]) {
  const supabase = createAdminClient();
  let query = supabase
    .from("facebook_posts")
    .update({
      is_stale: true,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("facebook_page_id", pageRecordId)
    .eq("is_mock", false);

  if (activePostIds.length > 0) {
    query = query.not("post_id", "in", `(${activePostIds.map((postId) => JSON.stringify(postId)).join(",")})`);
  }

  const { data, error } = await query.select("id");
  if (error) throw error;
  return data ?? [];
}

export async function createPlaceholderFacebookPost(userId: string, pageRecordId: string, postId: string, rawPayload: Record<string, unknown>) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facebook_posts")
    .insert({
      user_id: userId,
      facebook_page_id: pageRecordId,
      post_id: postId,
      message: null,
      image_url: null,
      permalink_url: null,
      created_time: null,
      facebook_created_time: null,
      raw_payload: rawPayload,
      connection_type: "facebook",
      is_mock: false,
      is_stale: false,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getPostsByPageIds(pageRecordId: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facebook_posts")
    .select("id, post_id")
    .eq("facebook_page_id", pageRecordId)
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function deletePostsByPage(pageRecordId: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facebook_posts")
    .delete()
    .eq("facebook_page_id", pageRecordId)
    .eq("user_id", userId)
    .select("id");
  if (error) throw error;
  return data ?? [];
}
