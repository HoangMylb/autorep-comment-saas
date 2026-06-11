import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { sendTestComment } from "@/backend/services/mock-facebook.service";

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const user = await requireUser();
    return sendTestComment(user.id, await request.json());
  }, 201);
}
