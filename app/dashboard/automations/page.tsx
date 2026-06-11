import { Button } from "antd";
import { requireUser } from "@/backend/lib/auth";
import { getUserAutomations } from "@/backend/services/mock-facebook.service";
import { EmptyState } from "@/frontend/components/common/empty-state";
import { PageShell } from "@/frontend/components/common/page-shell";
import { AutomationsTable } from "@/frontend/features/dashboard/components/automations-table";

export default async function AutomationsPage() {
  const user = await requireUser();
  const automations = await getUserAutomations(user.id);

  return (
    <PageShell title="Automations" description="Manage keyword rules, inbox responses, and public replies for demo Facebook posts." actions={<Button type="primary" href="/dashboard/automations/new">Create Automation</Button>}>
      {automations.length ? <AutomationsTable automations={automations} /> : <EmptyState title="No automations yet" description="Create an automation from one of your demo posts to begin testing the mock flow." action={{ label: "Create Automation", href: "/dashboard/automations/new" }} />}
    </PageShell>
  );
}
