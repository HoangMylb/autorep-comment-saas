import { createAdminClient } from "@/backend/lib/supabase";

const demoPosts = [
  {
    post_id: "mock_post_1",
    message: "🔥 Ai muốn nhận bảng giá sản phẩm hôm nay, comment XIN GIÁ bên dưới nhé.",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80",
    permalink_url: "https://example.com/mock-post-1"
  },
  {
    post_id: "mock_post_2",
    message: "Để nhận link mua hàng ưu đãi, comment LINK mình gửi ngay.",
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
    permalink_url: "https://example.com/mock-post-2"
  },
  {
    post_id: "mock_post_3",
    message: "Bạn cần tư vấn sản phẩm phù hợp? Comment TƯ VẤN để mình hỗ trợ.",
    image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    permalink_url: "https://example.com/mock-post-3"
  }
];

export async function getPostsByPage(userId: string, pageId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facebook_posts")
    .select("*, facebook_pages(page_name)")
    .eq("user_id", userId)
    .eq("facebook_page_id", pageId)
    .order("created_time", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createDemoPosts(userId: string, pageId: string) {
  const supabase = createAdminClient();
  const existing = await supabase.from("facebook_posts").select("*").eq("user_id", userId).eq("facebook_page_id", pageId).eq("is_mock", true);
  if (existing.error) throw existing.error;
  if ((existing.data ?? []).length > 0) return existing.data ?? [];

  const payload = demoPosts.map((post, index) => ({
    user_id: userId,
    facebook_page_id: pageId,
    post_id: `${post.post_id}_${userId}`,
    message: post.message,
    image_url: post.image_url,
    permalink_url: post.permalink_url,
    created_time: new Date(Date.now() - index * 86_400_000).toISOString(),
    is_mock: true,
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase.from("facebook_posts").insert(payload).select("*");
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
