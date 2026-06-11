import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { disconnectFacebookPageAndDisableAutomations } from "@/backend/services/facebook-post-sync.service";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const page = await disconnectFacebookPageAndDisableAutomations(user.id, params.id);
    return {
      page
    };
  });
}
