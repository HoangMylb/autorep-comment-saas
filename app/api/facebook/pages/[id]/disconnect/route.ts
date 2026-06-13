import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { disconnectFacebookPageAndDeleteLocalData } from "@/backend/services/facebook-post-sync.service";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    return disconnectFacebookPageAndDeleteLocalData(user.id, params.id);
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return POST(request, { params });
}
