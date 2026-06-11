import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { createAutomationRecord, getUserAutomations } from "@/backend/services/mock-facebook.service";

export async function GET() {
  return withApiHandler(async () => {
    const user = await requireUser();
    const automations = await getUserAutomations(user.id);
    return { automations };
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const automation = await createAutomationRecord(user.id, await request.json());
    return { automation };
  }, 201);
}
