import { Button, Card } from "antd";
import { requireUser } from "@/backend/lib/auth";
import { getUserPages } from "@/backend/services/mock-facebook.service";
import { EmptyState } from "@/frontend/components/common/empty-state";
import { PageShell } from "@/frontend/components/common/page-shell";
import { StatusBadge } from "@/frontend/features/dashboard/components/status-badge";
import { ConnectFacebookButton } from "@/frontend/features/dashboard/components/connect-facebook-button";
import { DisconnectFacebookPageButton } from "@/frontend/features/dashboard/components/disconnect-facebook-page-button";
import { SetupDemoButton } from "@/frontend/features/dashboard/components/setup-demo-button";
import { SyncFacebookPostsButton } from "@/frontend/features/dashboard/components/sync-facebook-posts-button";
import { getServerEnv } from "@/backend/lib/env";

export default async function FacebookPagesPage() {
  const user = await requireUser();
  const pages = await getUserPages(user.id);
  const env = getServerEnv();
  const realModeEnabled = env.ENABLE_FACEBOOK_REAL_MODE && Boolean(env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET);

  return (
    <PageShell title="Facebook Pages" description="Use mock mode or connect a real Facebook Page to drive automations." actions={<div className="flex flex-wrap gap-3"><SetupDemoButton /><ConnectFacebookButton disabled={!realModeEnabled} /></div>}>
      {!realModeEnabled ? <Card className="mb-4 rounded-[20px] border-yellow-200 bg-yellow-50 text-sm text-yellow-800">Facebook integration is not configured yet. Mock mode is still available.</Card> : null}
      {pages.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id} className="rounded-[28px] border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{page.page_name}</p>
                  <p className="mt-2 text-sm text-slate-500">{page.page_id}</p>
                  {page.error_message ? <p className="mt-2 text-xs text-red-500">{page.error_message}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={page.connection_type ?? (page.is_mock ? "mock" : "facebook")} />
                  <StatusBadge status={page.status} />
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p>Last synced: {page.last_synced_at ?? "-"}</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button href={`/dashboard/posts?pageId=${page.id}`}>View Posts</Button>
                {(page.connection_type ?? (page.is_mock ? "mock" : "facebook")) === "facebook" ? <SyncFacebookPostsButton pageId={page.id} /> : null}
                {(page.connection_type ?? (page.is_mock ? "mock" : "facebook")) === "facebook" ? <DisconnectFacebookPageButton pageId={page.id} /> : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No Facebook Pages yet" description="Generate demo data or connect a real Facebook Page to start the automation flow." action={{ label: "Use Demo Facebook Page", render: <div className="flex gap-3"><SetupDemoButton /><ConnectFacebookButton disabled={!realModeEnabled} /></div> }} />
      )}
    </PageShell>
  );
}
