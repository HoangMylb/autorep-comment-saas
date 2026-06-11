import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireAdmin } from "@/backend/lib/auth";
import { getAdminPages } from "@/backend/services/mock-facebook.service";

export async function GET() {
  return withApiHandler(async () => {
    await requireAdmin();
    const pages = await getAdminPages();
    return { pages };
  });
}
