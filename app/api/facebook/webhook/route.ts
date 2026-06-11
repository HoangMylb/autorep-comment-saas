import { NextResponse } from "next/server";
import { getServerEnv } from "@/backend/lib/env";
import { handleWebhookPayload } from "@/backend/services/facebook-webhook.service";
import { logFacebookSystemEvent } from "@/backend/lib/facebook-log";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const verifyToken = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const env = getServerEnv();

  if (mode === "subscribe" && verifyToken && challenge && env.FACEBOOK_VERIFY_TOKEN === verifyToken) {
    await logFacebookSystemEvent({
      level: "info",
      source: "facebook_webhook",
      message: "Facebook webhook verification successful",
      metadata: { mode }
    });
    return new Response(challenge, { status: 200 });
  }

  await logFacebookSystemEvent({
    level: "warning",
    source: "facebook_webhook",
    message: "Facebook webhook verification failed",
    metadata: { mode }
  });

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await handleWebhookPayload(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Webhook processed",
        data: result
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    await logFacebookSystemEvent({
      level: "error",
      source: "facebook_webhook",
      message: "Facebook webhook processing failed",
      metadata: { error: message }
    });

    return NextResponse.json(
      {
        success: false,
        message,
        error: message
      },
      { status: 400 }
    );
  }
}
