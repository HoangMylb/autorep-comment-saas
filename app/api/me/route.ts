import { withApiHandler } from "@/backend/middlewares/api-handler";
import { getProfileById } from "@/backend/repositories/profile-repository";
import { requireUser } from "@/backend/lib/auth";

export async function GET() {
  return withApiHandler(async () => {
    const user = await requireUser();
    const profile = await getProfileById(user.id);
    return { profile };
  });
}
