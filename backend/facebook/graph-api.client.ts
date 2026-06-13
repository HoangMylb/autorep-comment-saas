import { getServerEnv } from "@/backend/lib/env";

type GraphErrorShape = {
  error?: { message?: string; code?: number };
};

async function parseGraphResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & GraphErrorShape;
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Facebook API request failed (${response.status})`);
  }
  return data;
}

export async function facebookGraphGet<T>(path: string, params: Record<string, string>) {
  const env = getServerEnv();
  const query = new URLSearchParams(params);
  const response = await fetch(`https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/${path}?${query.toString()}`, {
    cache: "no-store"
  });
  return parseGraphResponse<T>(response);
}

export async function facebookGraphPostForm<T>(path: string, body: Record<string, string>) {
  const env = getServerEnv();
  const response = await fetch(`https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(body).toString(),
    cache: "no-store"
  });
  return parseGraphResponse<T>(response);
}

export async function facebookGraphPostJson<T>(path: string, body: Record<string, unknown>, accessToken?: string) {
  const env = getServerEnv();
  const tokenSuffix = accessToken ? `?access_token=${encodeURIComponent(accessToken)}` : "";
  const response = await fetch(`https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/${path}${tokenSuffix}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });
  return parseGraphResponse<T>(response);
}
