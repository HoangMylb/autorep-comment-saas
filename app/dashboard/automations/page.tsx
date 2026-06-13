import { Button } from "antd";
import { PageShell } from "@/frontend/components/common/page-shell";
import { DashboardAutomationsClient } from "@/frontend/features/dashboard/components/dashboard-automations-client";

export default function AutomationsPage() {
  return (
    <PageShell title="Automations" description="Manage keyword rules, inbox responses, and public replies for synced Facebook posts." actions={<Button type="primary" href="/dashboard/automations/new">Create Automation</Button>}>
      <DashboardAutomationsClient />
    </PageShell>
  );
}
