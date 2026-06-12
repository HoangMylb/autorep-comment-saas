import { getServerEnv } from "@/backend/lib/env";

export interface FacebookMessageResult {
  success: boolean;
  status: "success" | "failed" | "skipped";
  errorMessage?: string;
  rawResponse?: unknown;
}

interface PrivateReplyInput {
  pageAccessToken: string | null;
  commentId: string;
  commentMessage: string;
}

interface PublicReplyInput {
  pageAccessToken: string | null;
  commentId: string;
  message: string | null;
}

async function fetchFacebookApi<T>(url: string, body: URLSearchParams) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString(),
    cache: "no-store"
  });

  const data = (await response.json()) as T & { error?: { message?: string } };

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `Facebook API request failed (${response.status})`);
  }

  return data;
}

export async function sendPrivateReplyToComment(input: PrivateReplyInput): Promise<FacebookMessageResult> {
  const env = getServerEnv();

  if (!env.ENABLE_FACEBOOK_SEND_MESSAGE) {
    return {
      success: true,
      status: "skipped",
      errorMessage: "Facebook send message disabled by feature flag"
    };
  }

  if (!input.pageAccessToken) {
    return {
      success: false,
      status: "failed",
      errorMessage: "Missing Facebook page access token"
    };
  }

  return {
    success: false,
    status: "failed",
    errorMessage: "Missing Facebook permission or App Review not approved"
  };
}

export async function sendPublicReplyToComment(input: PublicReplyInput): Promise<FacebookMessageResult> {
  const env = getServerEnv();

  if (!env.ENABLE_FACEBOOK_PUBLIC_REPLY) {
    return {
      success: true,
      status: "skipped",
      errorMessage: "Facebook public reply disabled by feature flag"
    };
  }

  if (!input.message) {
    return {
      success: true,
      status: "skipped",
      errorMessage: "No public reply message configured"
    };
  }

  if (!input.pageAccessToken) {
    return {
      success: false,
      status: "failed",
      errorMessage: "Missing Facebook page access token"
    };
  }

  try {
    const rawResponse = await fetchFacebookApi<{ id?: string }>(
      `https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/${input.commentId}/comments`,
      new URLSearchParams({
        message: input.message,
        access_token: input.pageAccessToken
      })
    );

    return {
      success: true,
      status: "success",
      rawResponse
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Facebook public reply failed";
    return {
      success: false,
      status: "failed",
      errorMessage: message,
      rawResponse: null
    };
  }
}
