import { getServerEnv } from "@/backend/lib/env";

export interface FacebookMessageResult {
  success: boolean;
  status: "success" | "failed" | "failed_permission" | "skipped" | "skipped_duplicate";
  errorMessage?: string;
  rawResponse?: unknown;
}

interface PrivateReplyInput {
  facebookPageId: string;
  pageAccessToken: string | null;
  facebookCommentId: string;
  message: string;
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

function isPermissionError(message: string) {
  return /permission|not authorized|not allowed|review|capabilit|unsupported post request/i.test(message);
}

function sanitizeFacebookError(message: string) {
  if (/pages_messaging/i.test(message)) {
    return "Missing Meta permission: pages_messaging";
  }

  return message.length > 180 ? `${message.slice(0, 177)}...` : message;
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
      status: isPermissionError(message) ? "failed_permission" : "failed",
      errorMessage: sanitizeFacebookError(message),
      rawResponse: null
    };
  }
}

export async function sendPrivateReplyToComment(input: PrivateReplyInput): Promise<FacebookMessageResult> {
  const env = getServerEnv();

  if (!env.ENABLE_FACEBOOK_SEND_MESSAGE) {
    return {
      success: true,
      status: "skipped",
      errorMessage: "Private reply disabled by config"
    };
  }

  if (!input.message.trim()) {
    return {
      success: true,
      status: "skipped",
      errorMessage: "No inbox message configured"
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
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${input.facebookPageId}/messages?access_token=${encodeURIComponent(input.pageAccessToken)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipient: {
            comment_id: input.facebookCommentId
          },
          message: {
            text: input.message
          }
        }),
        cache: "no-store"
      }
    );

    const rawResponse = (await response.json()) as { error?: { message?: string } };

    if (!response.ok || rawResponse.error) {
      throw new Error(rawResponse.error?.message || `Facebook private reply failed (${response.status})`);
    }

    return {
      success: true,
      status: "success",
      rawResponse
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Facebook private reply failed";
    const permissionMissing = /pages_messaging/i.test(message);
    return {
      success: false,
      status: permissionMissing || isPermissionError(message) ? "failed_permission" : "failed",
      errorMessage: sanitizeFacebookError(message),
      rawResponse: null
    };
  }
}
