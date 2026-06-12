import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { getFacebookPageWebhookStatus } from "@/backend/services/facebook-post-sync.service";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  
  return withApiHandler(async () => {
    const user = await requireUser();
    const result = await getFacebookPageWebhookStatus(user.id, params.id);
    return {
      facebookPageId: result.facebookPageId,
      appId: result.appId,
      subscribedApps: result.subscribedApps,
      isCurrentAppSubscribed: result.isCurrentAppSubscribed,
      hasFeedField: result.hasFeedField
    };
  });
}
