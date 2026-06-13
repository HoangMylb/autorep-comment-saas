import { PageShell } from "@/frontend/components/common/page-shell";
import { DashboardLoadingShell } from "@/frontend/components/common/dashboard-loading-shell";

export default function Loading() {
  return (
    <PageShell title="Facebook Pages" description="Use mock mode or connect a real Facebook Page to drive automations.">
      <DashboardLoadingShell rows={3} />
    </PageShell>
  );
}
