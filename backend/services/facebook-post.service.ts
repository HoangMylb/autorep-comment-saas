import { getAllPostsForAdmin, getPostsByPage } from "@/backend/repositories/facebook-post.repository";
import { getPageById } from "@/backend/repositories/facebook-page.repository";
import { syncPagePosts } from "@/backend/services/facebook-post-sync.service";

function unwrapRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
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

export async function syncUserFacebookPosts(userId: string, pageId: string) {
  return syncPagePosts(userId, pageId);
}

export async function getAdminPosts() {
  return getAllPostsForAdmin();
}
