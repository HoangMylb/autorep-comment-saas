import { PageShell } from "@/frontend/components/common/page-shell";
import { StatCard } from "@/frontend/components/common/stat-card";
import { requireAdmin } from "@/backend/lib/auth";
import { getAdminOverview } from "@/backend/services/admin-service";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const overview = await getAdminOverview();

  return (
    <PageShell title="Admin overview" description="System-wide visibility into users, Facebook Pages, automations, and comment logs.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Users" value={overview.totalUsers} />
        <StatCard label="Active users" value={overview.activeUsers} />
        <StatCard label="Blocked users" value={overview.blockedUsers} />
        <StatCard label="Admins" value={overview.totalAdmins} />
        <StatCard label="Pages" value={overview.totalPages} />
        <StatCard label="Logs" value={overview.totalLogs} helper={`${overview.totalAutomations} automations`} />
      </div>
    </PageShell>
  );
}
