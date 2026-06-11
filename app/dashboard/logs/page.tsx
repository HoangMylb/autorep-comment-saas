import { requireUser } from "@/backend/lib/auth";
import { getUserAutomations, getUserLogs } from "@/backend/services/mock-facebook.service";
import { EmptyState } from "@/frontend/components/common/empty-state";
import { PageShell } from "@/frontend/components/common/page-shell";
import { LogsTable } from "@/frontend/features/dashboard/components/logs-table";

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ status?: string; keyword?: string; automation?: string }> }) {
  const user = await requireUser();
  const filters = await searchParams;
  const [logs, automations] = await Promise.all([
    getUserLogs(user.id, filters),
    getUserAutomations(user.id)
  ]);

  return (
    <PageShell title="Logs" description="Review the result of each mock comment test and verify keyword matching behavior.">
      {logs.length ? <LogsTable logs={logs} /> : <EmptyState title="No logs yet" description={`Create an automation${automations.length ? " and send a test comment" : " after generating demo data"} to see delivery results here.`} />}
    </PageShell>
  );
}
