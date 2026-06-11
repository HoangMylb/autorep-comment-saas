import { NextResponse } from "next/server";
import { requireUser } from "@/backend/lib/auth";
import { getFacebookLoginUrl } from "@/backend/services/facebook-oauth.service";
import { logFacebookSystemEvent } from "@/backend/lib/facebook-log";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const { url } = getFacebookLoginUrl(user.id);
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    await logFacebookSystemEvent({
      level: "warning",
      source: "facebook_oauth",
      message: "Failed to start Facebook OAuth flow",
      metadata: { error: message }
    });

    const redirectUrl = new URL("/dashboard/pages", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    redirectUrl.searchParams.set("error", message);
    return NextResponse.redirect(redirectUrl);
  }
}
