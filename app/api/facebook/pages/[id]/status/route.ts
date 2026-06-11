import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { getFacebookPageStatus } from "@/backend/services/facebook-post-sync.service";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    return getFacebookPageStatus(user.id, params.id);
  });
}
