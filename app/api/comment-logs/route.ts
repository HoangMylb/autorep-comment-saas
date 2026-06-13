import { NextRequest } from "next/server";
import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { getUserLogs } from "@/backend/services/mock-facebook.service";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const filters = {
      automation: request.nextUrl.searchParams.get("automation") ?? undefined,
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      post: request.nextUrl.searchParams.get("post") ?? undefined,
      source: request.nextUrl.searchParams.get("source") ?? undefined,
      processing: request.nextUrl.searchParams.get("processing") ?? request.nextUrl.searchParams.get("processing_status") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      keyword: request.nextUrl.searchParams.get("keyword") ?? undefined,
      limit: Number(request.nextUrl.searchParams.get("limit") ?? "50")
    };

    const logs = await getUserLogs(user.id, filters);
    return {
      logs: logs.map((log) => ({
        id: log.id,
        source: log.source,
        processing_status: log.processing_status,
        commenter_name: log.commenter_name,
        comment_message: log.comment_message,
        matched_keyword: log.matched_keyword,
        inbox_status: log.inbox_status,
        public_reply_status: log.public_reply_status,
        error_message: log.error_message,
        created_at: log.created_at,
        automation_id: log.automation_id,
        facebook_page_id: log.facebook_page_id,
        facebook_post_id: log.facebook_post_id
      }))
    };
  });
}
