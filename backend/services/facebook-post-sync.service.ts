import { getServerEnv } from "@/backend/lib/env";
import { logFacebookSystemEvent, maskSensitiveToken } from "@/backend/lib/facebook-log";
import { deleteFacebookPage, getPageById, markFacebookPageWebhookSubscribed, updateFacebookPageStatus } from "@/backend/repositories/facebook-page.repository";
import { deletePostsByPage, getPostsByPageIds, markPostsMissingFromSyncAsStale, upsertFacebookPosts } from "@/backend/repositories/facebook-post.repository";
import { deleteAutomationsByPage, getAutomationsByPageIds } from "@/backend/repositories/automation.repository";
import { deleteLogsByAutomationIds, deleteLogsByPage, deleteLogsByPostIds } from "@/backend/repositories/comment-log.repository";

interface FacebookGraphPostsResponse {
  data?: Array<{
    id: string;
    message?: string;
    full_picture?: string;
    picture?: string;
    permalink_url?: string;
    created_time?: string;
  }>;
  error?: { message?: string; code?: number };
}

async function fetchFacebookPosts(pageId: string, pageAccessToken: string) {
  const env = getServerEnv();
  const params = new URLSearchParams({
    fields: "id,message,full_picture,picture,permalink_url,created_time",
    access_token: pageAccessToken
  });

  const response = await fetch(`https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/${pageId}/posts?${params.toString()}`, {
    cache: "no-store"
  });

  const data = (await response.json()) as FacebookGraphPostsResponse;

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Facebook posts sync failed (${response.status})`);
  }

  return data.data ?? [];
}

export async function syncPagePosts(userId: string, facebookPageRecordId: string) {
  const page = await getPageById(facebookPageRecordId, userId);

  if (!page) {
    throw new Error("Facebook page not found");
  }

  if (page.connection_type !== "facebook") {
    throw new Error("This page is not connected to real Facebook");
  }

  if (!page.page_access_token) {
    throw new Error("Missing Facebook page access token");
  }

  try {
    const graphPosts = await fetchFacebookPosts(page.page_id, page.page_access_token);
    const savedPosts = await upsertFacebookPosts(
      userId,
      page.id,
      graphPosts.map((post) => ({
        post_id: post.id,
        message: post.message ?? null,
        image_url: post.full_picture ?? post.picture ?? null,
        permalink_url: post.permalink_url ?? null,
        facebook_created_time: post.created_time ?? null,
        created_time: post.created_time ?? null,
        raw_payload: post
      }))
    );
    const stalePosts = await markPostsMissingFromSyncAsStale(
      userId,
      page.id,
      graphPosts.map((post) => post.id)
    );

    const syncedPage = await updateFacebookPageStatus(page.id, userId, {
      status: "connected",
      error_message: null,
      last_synced_at: new Date().toISOString()
    });

    await logFacebookSystemEvent({
      level: "info",
      source: "facebook_api",
      message: "Facebook posts synced successfully",
      metadata: {
        userId,
        pageId: page.page_id,
        savedPostCount: savedPosts.length,
        stalePostCount: stalePosts.length,
        token: maskSensitiveToken(page.page_access_token)
      }
    });

    return {
      page: syncedPage,
      count: savedPosts.length,
      staleCount: stalePosts.length,
      posts: savedPosts
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";

    const isTokenExpired = /expired|invalid|access token/i.test(message);

    await updateFacebookPageStatus(page.id, userId, {
      status: isTokenExpired ? "expired" : page.status,
      error_message: message
    });

    await logFacebookSystemEvent({
      level: "error",
      source: "facebook_api",
      message: "Facebook posts sync failed",
      metadata: {
        userId,
        pageId: page.page_id,
        error: message,
        token: maskSensitiveToken(page.page_access_token)
      }
    });

    throw error;
  }
}

export async function getFacebookPageStatus(userId: string, facebookPageRecordId: string) {
  const page = await getPageById(facebookPageRecordId, userId);
  if (!page) {
    throw new Error("Facebook page not found");
  }

  return {
    status: page.status,
    connection_type: page.connection_type,
    last_synced_at: page.last_synced_at,
    token_expires_at: page.token_expires_at,
    permissions: page.permissions ?? [],
    error_message: page.error_message
  };
}

export async function disconnectFacebookPageAndDeleteLocalData(userId: string, facebookPageRecordId: string) {
  const page = await getPageById(facebookPageRecordId, userId);
  if (!page) {
    throw new Error("Facebook page not found");
  }

  const relatedAutomations = await getAutomationsByPageIds(page.id, userId);
  const relatedPosts = await getPostsByPageIds(page.id, userId);

  const deletedLogsDirect = await deleteLogsByPage(page.id, userId);
  const deletedLogsByAutomations = await deleteLogsByAutomationIds(relatedAutomations.map((item) => item.id), userId);
  const deletedLogsByPosts = await deleteLogsByPostIds(relatedPosts.map((item) => item.id), userId);
  const deletedAutomations = await deleteAutomationsByPage(page.id, userId);
  const deletedPosts = await deletePostsByPage(page.id, userId);
  const deletedPage = await deleteFacebookPage(page.id, userId);

  const deletedLogIds = new Set([
    ...deletedLogsDirect.map((item) => item.id),
    ...deletedLogsByAutomations.map((item) => item.id),
    ...deletedLogsByPosts.map((item) => item.id)
  ]);

  const deleted = {
    page: deletedPage.length,
    posts: deletedPosts.length,
    automations: deletedAutomations.length,
    logs: deletedLogIds.size
  };

  await logFacebookSystemEvent({
    level: "info",
    source: "facebook_page_disconnect",
    message: "Disconnected and deleted local page data",
    metadata: {
      userId,
      pageDbId: page.id,
      facebookPageId: page.page_id,
      deleted
    }
  });

  return {
    success: true,
    deleted
  };
}

export async function subscribeFacebookPageWebhook(userId: string, facebookPageRecordId: string) {
  const page = await getPageById(facebookPageRecordId, userId);

  if (!page) {
    throw new Error("Facebook page not found");
  }

  if (page.connection_type !== "facebook") {
    throw new Error("Webhook subscription is only available for real Facebook pages");
  }

  if (!page.page_access_token) {
    throw new Error("Missing Facebook page access token");
  }

  const env = getServerEnv();

  try {
    const params = new URLSearchParams();
    params.append("access_token", page.page_access_token);
    params.append("subscribed_fields", "feed");

    const response = await fetch(`https://graph.facebook.com/v25.0/${page.page_id}/subscribed_apps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString(),
      cache: "no-store"
    });

    const result = (await response.json()) as { success?: boolean; error?: { message?: string } };

    if (!response.ok || result.error) {
      throw new Error(result.error?.message || "Failed to subscribe Facebook page webhook");
    }

    const verifyResponse = await fetch(
      `https://graph.facebook.com/v25.0/${page.page_id}/subscribed_apps?access_token=${encodeURIComponent(page.page_access_token)}`,
      {
        method: "GET",
        cache: "no-store"
      }
    );

    const verifyResult = (await verifyResponse.json()) as { data?: Array<Record<string, unknown>>; error?: { message?: string } };

    if (!verifyResponse.ok || verifyResult.error) {
      throw new Error(verifyResult.error?.message || "Failed to verify Facebook page webhook subscription");
    }

    const updatedPage = await markFacebookPageWebhookSubscribed(page.id, userId);

    await logFacebookSystemEvent({
      level: "info",
      source: "facebook_api",
      message: "Facebook page subscribed to webhook successfully",
      metadata: {
        userId,
        pageId: page.page_id,
        graphApiVersion: env.FACEBOOK_GRAPH_API_VERSION
      }
    });

    return updatedPage;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to subscribe Facebook page webhook";

    await updateFacebookPageStatus(page.id, userId, {
      error_message: message
    });

    await logFacebookSystemEvent({
      level: "error",
      source: "facebook_api",
      message: "Facebook page webhook subscription failed",
      metadata: {
        userId,
        pageId: page.page_id,
        error: message,
        graphApiVersion: env.FACEBOOK_GRAPH_API_VERSION
      }
    });
    throw new Error(message);
  }
}

export async function getFacebookPageWebhookStatus(userId: string, facebookPageRecordId: string) {
  const page = await getPageById(facebookPageRecordId, userId);

  if (!page) {
    throw new Error("Facebook page not found");
  }

  if (page.connection_type !== "facebook") {
    throw new Error("Webhook status is only available for real Facebook pages");
  }

  if (!page.page_access_token) {
    throw new Error("Missing Facebook page access token");
  }

  const env = getServerEnv();

  const response = await fetch(
    `https://graph.facebook.com/v25.0/${page.page_id}/subscribed_apps?access_token=${encodeURIComponent(page.page_access_token)}`,
    {
      method: "GET",
      cache: "no-store"
    }
  );

  const result = (await response.json()) as {
    data?: Array<Record<string, unknown>>;
    error?: { message?: string };
  };

  if (!response.ok || result.error) {
    const message = result.error?.message || "Failed to fetch Facebook page webhook status";
    await updateFacebookPageStatus(page.id, userId, {
      error_message: message
    });
    throw new Error(message);
  }

  const subscribedApps = result.data ?? [];
  const currentApp = subscribedApps.find((app) => String(app.id ?? "") === String(env.FACEBOOK_APP_ID ?? ""));
  const subscribedFields = Array.isArray(currentApp?.subscribed_fields)
    ? (currentApp?.subscribed_fields as unknown[])
    : [];
  const category = typeof currentApp?.category === "string" ? currentApp.category : null;
  const hasFeedField = subscribedFields.some((field) => String(field) === "feed") || category === "feed";

  return {
    facebookPageId: page.page_id,
    appId: env.FACEBOOK_APP_ID ?? null,
    subscribedApps,
    isCurrentAppSubscribed: Boolean(currentApp),
    hasFeedField
  };
}
