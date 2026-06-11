import { PageShell } from "@/frontend/components/common/page-shell";
import { AdminUsersTable } from "@/frontend/features/dashboard/components/admin-users-table";
import { requireAdmin } from "@/backend/lib/auth";
import { getAdminUsers } from "@/backend/services/admin-service";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getAdminUsers();

  return (
    <PageShell title="Users management" description="Review user accounts, roles, and block or reactivate access if needed.">
      <AdminUsersTable users={users} />
    </PageShell>
  );
}
