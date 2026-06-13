import { PageShell } from "@/frontend/components/common/page-shell";
import { DashboardLoadingShell } from "@/frontend/components/common/dashboard-loading-shell";

export default function Loading() {
  return (
    <PageShell title="Automations" description="Manage keyword rules, inbox responses, and public replies for synced Facebook posts.">
      <DashboardLoadingShell rows={4} />
    </PageShell>
  );
}
