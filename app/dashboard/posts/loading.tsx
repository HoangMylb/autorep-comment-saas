import { PageShell } from "@/frontend/components/common/page-shell";
import { DashboardLoadingShell } from "@/frontend/components/common/dashboard-loading-shell";

export default function Loading() {
  return (
    <PageShell title="Posts" description="Browse synced Facebook posts and create automations.">
      <DashboardLoadingShell rows={4} />
    </PageShell>
  );
}
