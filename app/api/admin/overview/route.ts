import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireAdmin } from "@/backend/lib/auth";
import { getAdminOverview } from "@/backend/services/admin-service";

export async function GET() {
  return withApiHandler(async () => {
    await requireAdmin();
    return getAdminOverview();
  });
}
