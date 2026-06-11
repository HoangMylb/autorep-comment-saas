import { NextRequest } from "next/server";
import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { getUserLogs } from "@/backend/services/mock-facebook.service";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const filters = {
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      keyword: request.nextUrl.searchParams.get("keyword") ?? undefined,
      automation: request.nextUrl.searchParams.get("automation") ?? undefined
    };
    const logs = await getUserLogs(user.id, filters);
    return { logs };
  });
}
