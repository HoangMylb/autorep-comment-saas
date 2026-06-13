import { getAllPagesForAdmin, getPageById, getPagesByUser } from "@/backend/repositories/facebook-page.repository";
import { disconnectFacebookPageAndDeleteLocalData, getFacebookPageStatus, getFacebookPageWebhookStatus, subscribeFacebookPageWebhook } from "@/backend/services/facebook-post-sync.service";

export async function getUserPages(userId: string) {
  return getPagesByUser(userId);
}

export async function getUserPageRecord(userId: string, pageId: string) {
  const page = await getPageById(pageId, userId);
  if (!page) throw new Error("Page not found");
  return page;
}

export async function getUserFacebookPageStatus(userId: string, pageId: string) {
  return getFacebookPageStatus(userId, pageId);
}

export async function subscribeUserFacebookPageWebhook(userId: string, pageId: string) {
  return subscribeFacebookPageWebhook(userId, pageId);
}

export async function getUserFacebookPageWebhookStatus(userId: string, pageId: string) {
  return getFacebookPageWebhookStatus(userId, pageId);
}

export async function disconnectUserFacebookPage(userId: string, pageId: string) {
  return disconnectFacebookPageAndDeleteLocalData(userId, pageId);
}

export async function getAdminPages() {
  return getAllPagesForAdmin();
}
