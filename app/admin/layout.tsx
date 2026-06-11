import { DashboardLayout } from "@/frontend/layouts/dashboard-layout";
import { adminNavItems } from "@/frontend/hooks/use-dashboard-nav";

export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="Admin dashboard" items={adminNavItems}>
      {children}
    </DashboardLayout>
  );
}
