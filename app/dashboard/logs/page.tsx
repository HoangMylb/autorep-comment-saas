import { Card } from "antd";
import { requireUser } from "@/backend/lib/auth";
import { getUserAutomations, getUserLogs } from "@/backend/services/mock-facebook.service";
import { EmptyState } from "@/frontend/components/common/empty-state";
import { PageShell } from "@/frontend/components/common/page-shell";
import { LogsTable } from "@/frontend/features/dashboard/components/logs-table";

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ status?: string; keyword?: string; automation?: string; source?: string; processing_status?: string }> }) {
  const user = await requireUser();
  const filters = await searchParams;
  const [logs, automations] = await Promise.all([
    getUserLogs(user.id, filters),
    getUserAutomations(user.id)
  ]);

  return (
    <PageShell title="Logs" description="Review mock and Facebook processing results, including skipped and failed events.">
      <Card className="rounded-[20px] border-slate-200 text-sm text-slate-500">
        Active filters - source: {filters.source ?? "all"}, processing: {filters.processing_status ?? "all"}, status: {filters.status ?? "all"}
      </Card>
      {logs.length ? <LogsTable logs={logs} /> : <EmptyState title="No logs yet" description={`Create an automation${automations.length ? " and send a test comment" : " after generating demo data"} to see delivery results here.`} />}
    </PageShell>
  );
}
