import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { subscribeFacebookPageWebhook } from "@/backend/services/facebook-post-sync.service";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const page = await subscribeFacebookPageWebhook(user.id, params.id);
    return {
      page
    };
  });
}
