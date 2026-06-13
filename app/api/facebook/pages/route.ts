import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { getUserPages } from "@/backend/services/facebook-page.service";

export async function GET() {
  return withApiHandler(async () => {
    const user = await requireUser();
    const pages = await getUserPages(user.id);
    return { pages };
  });
}
