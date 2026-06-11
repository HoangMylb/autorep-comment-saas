import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { toggleAutomationRecord } from "@/backend/services/mock-facebook.service";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const { id } = await params;
    const automation = await toggleAutomationRecord(user.id, id);
    return { automation };
  });
}
