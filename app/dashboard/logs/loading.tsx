import { PageShell } from "@/frontend/components/common/page-shell";
import { DashboardLoadingShell } from "@/frontend/components/common/dashboard-loading-shell";

export default function Loading() {
  return (
    <PageShell title="Logs" description="Review processing results without blocking route transitions.">
      <DashboardLoadingShell rows={5} />
    </PageShell>
  );
}
