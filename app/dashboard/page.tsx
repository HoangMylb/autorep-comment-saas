import { PageShell } from "@/frontend/components/common/page-shell";
import { StatCard } from "@/frontend/components/common/stat-card";
import { getDashboardOverview } from "@/backend/services/dashboard-service";
import { requireUser } from "@/backend/lib/auth";
import { LogsTable } from "@/frontend/features/dashboard/components/logs-table";
import { EmptyState } from "@/frontend/components/common/empty-state";

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const { stats, recentLogs } = await getDashboardOverview(user.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Your role" value={stats.admins ? "Admin" : "User"} />
        <StatCard label="Account status" value={stats.activeUsers ? "Active" : "Blocked"} />
        <StatCard label="Pages connected" value={stats.totalPages ?? 0} />
        <StatCard label="Automations" value={stats.totalAutomations ?? 0} />
        <StatCard label="Logs" value={stats.totalLogs ?? 0} helper="Recent Facebook activity" />
      </div>
      <PageShell title="Recent logs" description="Quick snapshot of the latest Facebook comments and delivery results.">
        {recentLogs && recentLogs.length ? <LogsTable logs={recentLogs} /> : <EmptyState title="No logs yet" description="Connect a Facebook Page, sync posts, and create an automation to populate this dashboard." />}
      </PageShell>
    </div>
  );
}
