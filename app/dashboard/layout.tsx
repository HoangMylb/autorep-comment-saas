import { DashboardLayout } from "@/frontend/layouts/dashboard-layout";
import { userNavItems } from "@/frontend/hooks/use-dashboard-nav";

export const dynamic = "force-dynamic";

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="User dashboard" items={userNavItems}>
      {children}
    </DashboardLayout>
  );
}
