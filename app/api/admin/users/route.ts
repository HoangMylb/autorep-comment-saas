import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireAdmin } from "@/backend/lib/auth";
import { changeUserStatus, getAdminUsers } from "@/backend/services/admin-service";

export async function GET() {
  return withApiHandler(async () => {
    await requireAdmin();
    const users = await getAdminUsers();
    return { users };
  });
}

export async function PATCH(request: Request) {
  return withApiHandler(async () => {
    await requireAdmin();
    const body = (await request.json()) as { userId: string; status: "active" | "blocked" };
    const user = await changeUserStatus(body.userId, body.status);
    return { user };
  });
}
