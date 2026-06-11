import { requireAdmin } from "@/backend/lib/auth";
import { getAdminLogs } from "@/backend/services/mock-facebook.service";
import { PageShell } from "@/frontend/components/common/page-shell";
import { LogsTable } from "@/frontend/features/dashboard/components/logs-table";

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<{ status?: string; keyword?: string; automation?: string }> }) {
  await requireAdmin();
  const filters = await searchParams;
  const logs = await getAdminLogs(filters);

  return (
    <PageShell title="Logs" description="Admin visibility into mock and Facebook processing logs across the system.">
      <LogsTable logs={logs} />
    </PageShell>
  );
}
