import { requireAdmin } from "@/backend/lib/auth";
import { getAdminPages } from "@/backend/services/mock-facebook.service";
import { PageShell } from "@/frontend/components/common/page-shell";
import { AdminPagesTable } from "@/frontend/features/dashboard/components/admin-pages-table";

export default async function AdminPagesPage() {
  await requireAdmin();
  const pages = await getAdminPages();

  return (
    <PageShell title="Pages" description="Admin visibility into all mock-connected Facebook Pages across users.">
      <AdminPagesTable pages={pages} />
    </PageShell>
  );
}
