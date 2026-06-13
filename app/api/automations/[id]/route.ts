import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { deleteAutomationRecord, getAutomationRecord, updateAutomationRecord } from "@/backend/services/automation.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const { id } = await params;
    const automation = await getAutomationRecord(user.id, id);
    return { automation };
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const { id } = await params;
    const automation = await updateAutomationRecord(user.id, id, await request.json());
    return { automation };
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const { id } = await params;
    await deleteAutomationRecord(user.id, id);
    return { success: true };
  });
}
