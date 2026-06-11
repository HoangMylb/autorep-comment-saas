import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { createDemoPageWithPosts } from "@/backend/services/mock-facebook.service";

export async function POST() {
  return withApiHandler(async () => {
    const user = await requireUser();
    return createDemoPageWithPosts(user.id);
  }, 201);
}
