import { NextRequest } from "next/server";
import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireAdmin } from "@/backend/lib/auth";
import { getAdminLogs } from "@/backend/services/mock-facebook.service";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    await requireAdmin();
    const filters = {
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      keyword: request.nextUrl.searchParams.get("keyword") ?? undefined,
      automation: request.nextUrl.searchParams.get("automation") ?? undefined
    };
    const logs = await getAdminLogs(filters);
    return { logs };
  });
}
