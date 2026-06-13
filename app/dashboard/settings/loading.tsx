import { PageShell } from "@/frontend/components/common/page-shell";
import { DashboardLoadingShell } from "@/frontend/components/common/dashboard-loading-shell";

export default function Loading() {
  return (
    <PageShell title="Account settings" description="Basic account profile and role information for the current user.">
      <DashboardLoadingShell rows={2} />
    </PageShell>
  );
}
