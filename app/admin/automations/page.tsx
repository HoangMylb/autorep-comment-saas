import { requireAdmin } from "@/backend/lib/auth";
import { getAdminAutomations } from "@/backend/services/mock-facebook.service";
import { PageShell } from "@/frontend/components/common/page-shell";
import { AdminAutomationsTable } from "@/frontend/features/dashboard/components/admin-automations-table";

export default async function AdminAutomationsPage() {
  await requireAdmin();
  const automations = await getAdminAutomations();

  return (
    <PageShell title="Automations" description="Admin visibility into all demo automations configured by users.">
      <AdminAutomationsTable automations={automations} />
    </PageShell>
  );
}
