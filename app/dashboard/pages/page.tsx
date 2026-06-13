import { PageShell } from "@/frontend/components/common/page-shell";
import { ConnectFacebookButton } from "@/frontend/features/dashboard/components/connect-facebook-button";
import { SetupDemoButton } from "@/frontend/features/dashboard/components/setup-demo-button";
import { DashboardPagesClient } from "@/frontend/features/dashboard/components/dashboard-pages-client";
import { getServerEnv } from "@/backend/lib/env";

export default function FacebookPagesPage() {
  const env = getServerEnv();
  const realModeEnabled = env.ENABLE_FACEBOOK_REAL_MODE && Boolean(env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET);

  return (
    <PageShell title="Facebook Pages" description="Use mock mode or connect a real Facebook Page to drive automations." actions={<div className="flex flex-wrap gap-3"><SetupDemoButton /><ConnectFacebookButton disabled={!realModeEnabled} /></div>}>
      <DashboardPagesClient realModeEnabled={realModeEnabled} />
    </PageShell>
  );
}
