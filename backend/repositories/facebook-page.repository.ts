import { createAdminClient } from "@/backend/lib/supabase";

const DEMO_PAGE_NAME = "Demo Affiliate Page";

export async function getPagesByUser(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("facebook_pages").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createDemoPage(userId: string) {
  const supabase = createAdminClient();
  const existing = await supabase
    .from("facebook_pages")
    .select("*")
    .eq("user_id", userId)
    .eq("is_mock", true)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const { data, error } = await supabase
    .from("facebook_pages")
    .insert({
      user_id: userId,
      page_id: `mock_page_${userId}`,
      page_name: DEMO_PAGE_NAME,
      page_avatar_url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200&q=80",
      page_access_token: "mock-access-token",
      status: "connected",
      is_mock: true,
      updated_at: new Date().toISOString()
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
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
