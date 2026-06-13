import { PageShell } from "@/frontend/components/common/page-shell";
import { DashboardLogsClient } from "@/frontend/features/dashboard/components/dashboard-logs-client";

export default function LogsPage() {
  return (
    <PageShell title="Logs" description="Review mock and Facebook processing results, including skipped and failed events.">
      <DashboardLogsClient />
    </PageShell>
  );
}
