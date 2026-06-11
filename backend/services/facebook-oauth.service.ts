import { randomUUID } from "crypto";
import { getServerEnv } from "@/backend/lib/env";
import { logFacebookSystemEvent, maskSensitiveToken } from "@/backend/lib/facebook-log";
import { upsertFacebookPages } from "@/backend/repositories/facebook-page.repository";

interface FacebookPageDto {
  page_id: string;
  page_name: string;
  page_avatar_url: string | null;
  page_access_token: string | null;
  user_access_token: string | null;
  token_expires_at: string | null;
  permissions: string[];
  status: "connected" | "expired" | "disconnected";
  error_message: string | null;
}

interface FacebookAccountsResponse {
  data?: Array<{
    id: string;
    name: string;
    access_token?: string;
    picture?: { data?: { url?: string } };
    perms?: string[];
  }>;
}

interface AccessTokenResponse {
  access_token?: string;
  expires_in?: number;
}

function requireFacebookConfig() {
  const env = getServerEnv();

  if (!env.ENABLE_FACEBOOK_REAL_MODE) {
    throw new Error("Facebook real mode is disabled");
  }

  if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) {
    throw new Error("Facebook integration is not configured yet");
  }

  return env;
}

function buildState(userId: string) {
  return `${userId}:${randomUUID()}`;
}

function parseState(state: string) {
  const [userId, nonce] = state.split(":");
  if (!userId || !nonce) {
    throw new Error("Invalid Facebook OAuth state");
  }
  return { userId, nonce };
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json()) as T & { error?: { message?: string } };

  if (!response.ok || data?.error) {
    throw new Error(data?.error?.message || `Facebook API request failed (${response.status})`);
  }

  return data;
}

export function getFacebookLoginUrl(userId: string) {
  const env = requireFacebookConfig();
  const state = buildState(userId);
  const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`;
  const params = new URLSearchParams({
    client_id: env.FACEBOOK_APP_ID!,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_messaging",
      "pages_manage_engagement"
    ].join(",")
  });

  return {
    url: `https://www.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`,
    state
  };
}

export async function exchangeCodeForUserAccessToken(code: string) {
  const env = requireFacebookConfig();
  const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`;
  const params = new URLSearchParams({
    client_id: env.FACEBOOK_APP_ID!,
    client_secret: env.FACEBOOK_APP_SECRET!,
    redirect_uri: redirectUri,
    code
  });

  return fetchJson<AccessTokenResponse>(`https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/oauth/access_token?${params.toString()}`);
}

export async function getLongLivedUserAccessToken(shortLivedToken: string) {
  const env = requireFacebookConfig();
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: env.FACEBOOK_APP_ID!,
    client_secret: env.FACEBOOK_APP_SECRET!,
    fb_exchange_token: shortLivedToken
  });

  return fetchJson<AccessTokenResponse>(`https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/oauth/access_token?${params.toString()}`);
}

export async function fetchUserPages(userAccessToken: string) {
  const env = requireFacebookConfig();
  const params = new URLSearchParams({
    fields: "id,name,access_token,picture{url},perms",
    access_token: userAccessToken
  });

  return fetchJson<FacebookAccountsResponse>(`https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/me/accounts?${params.toString()}`);
}

export async function saveFacebookPages(userId: string, pages: FacebookPageDto[]) {
  return upsertFacebookPages(userId, pages);
}

export async function handleFacebookCallback(code: string, state: string) {
  const env = requireFacebookConfig();
  const { userId } = parseState(state);

  const shortLived = await exchangeCodeForUserAccessToken(code);
  const longLived = await getLongLivedUserAccessToken(shortLived.access_token ?? "");
  const userAccessToken = longLived.access_token ?? shortLived.access_token;

  if (!userAccessToken) {
    throw new Error("Unable to exchange Facebook user access token");
  }

  const pagesResponse = await fetchUserPages(userAccessToken);
  const tokenExpiresAt = longLived.expires_in
    ? new Date(Date.now() + longLived.expires_in * 1000).toISOString()
    : null;

  const pages: FacebookPageDto[] = (pagesResponse.data ?? []).map((page) => ({
    page_id: page.id,
    page_name: page.name,
    page_avatar_url: page.picture?.data?.url ?? null,
    page_access_token: page.access_token ?? null,
    user_access_token: userAccessToken,
    token_expires_at: tokenExpiresAt,
    permissions: page.perms ?? [],
    status: "connected",
    error_message: null
  }));

  await saveFacebookPages(userId, pages);

  await logFacebookSystemEvent({
    level: "info",
    source: "facebook_oauth",
    message: "Facebook pages connected successfully",
    metadata: {
      userId,
      pageCount: pages.length,
      token: maskSensitiveToken(userAccessToken),
      graphApiVersion: env.FACEBOOK_GRAPH_API_VERSION
    }
  });

  return {
    userId,
    redirectTo: "/dashboard/pages?connected=facebook",
    pages
  };
}
