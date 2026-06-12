import { NextResponse } from "next/server";
import { handleFacebookCallback } from "@/backend/services/facebook-oauth.service";
import { logFacebookSystemEvent } from "@/backend/lib/facebook-log";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorReason = url.searchParams.get("error_reason");
  const errorDescription = url.searchParams.get("error_description");

  const redirectUrl = new URL("/dashboard/pages", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

  if (error) {
    const message = errorDescription || errorReason || error;
    try {
      await logFacebookSystemEvent({
        level: "warning",
        source: "facebook_oauth",
        message: "Facebook OAuth permission denied or failed",
        metadata: { error, errorReason, errorDescription }
      });
    } catch (logError) {
      console.error("[system-log] failed", logError);
    }
    redirectUrl.searchParams.set("error", message);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    redirectUrl.searchParams.set("error", "Missing Facebook OAuth callback parameters");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const result = await handleFacebookCallback(code, state);
    return NextResponse.redirect(new URL(result.redirectTo, redirectUrl.origin));
  } catch (callbackError) {
    const message = callbackError instanceof Error ? callbackError.message : "Unknown error";
    console.error("[facebook-callback] failed", callbackError);
    try {
      await logFacebookSystemEvent({
        level: "error",
        source: "facebook_oauth",
        message: "Facebook OAuth callback failed",
        metadata: { error: message }
      });
    } catch (logError) {
      console.error("[system-log] failed", logError);
    }
    redirectUrl.searchParams.set("error", message);
    return NextResponse.redirect(redirectUrl);
  }
}
