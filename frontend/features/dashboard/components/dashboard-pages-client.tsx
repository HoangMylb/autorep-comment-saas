"use client";

import { Button, Card, Empty } from "antd";
import { useAppQuery } from "@/frontend/hooks/use-app-query";
import { StatusBadge } from "@/frontend/features/dashboard/components/status-badge";
import { ConnectFacebookButton } from "@/frontend/features/dashboard/components/connect-facebook-button";
import { CheckFacebookWebhookButton } from "@/frontend/features/dashboard/components/check-facebook-webhook-button";
import { DisconnectFacebookPageButton } from "@/frontend/features/dashboard/components/disconnect-facebook-page-button";
import { SubscribeFacebookWebhookButton } from "@/frontend/features/dashboard/components/subscribe-facebook-webhook-button";
import { SyncFacebookPostsButton } from "@/frontend/features/dashboard/components/sync-facebook-posts-button";
import type { PagesPayload } from "@/frontend/types/api";

export function DashboardPagesClient({ realModeEnabled }: { realModeEnabled: boolean }) {
  const { data, isLoading } = useAppQuery<PagesPayload>(["facebook-pages"], "/facebook/pages", 60_000);
  const pages = data?.pages ?? [];

  if (isLoading) {
    return <Card className="rounded-[28px] border-slate-200">Loading pages…</Card>;
  }

  return (
    <div className="space-y-4">
      {!realModeEnabled ? <Card className="rounded-[20px] border-yellow-200 bg-yellow-50 text-sm text-yellow-800">Facebook integration is not configured yet.</Card> : null}
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
                <p>Webhook: {page.webhook_subscribed ? `Subscribed${page.webhook_subscribed_at ? ` at ${page.webhook_subscribed_at}` : ""}` : "Not subscribed"}</p>
                {Array.isArray(page.permissions) && !page.permissions.includes("pages_messaging") ? <p className="text-xs text-amber-600">Reconnect this Page after granting pages_messaging.</p> : null}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button href={`/dashboard/posts?pageId=${page.id}`}>View Posts</Button>
                {(page.connection_type ?? (page.is_mock ? "mock" : "facebook")) === "facebook" ? <SyncFacebookPostsButton pageId={page.id} /> : null}
                {(page.connection_type ?? (page.is_mock ? "mock" : "facebook")) === "facebook" ? <CheckFacebookWebhookButton pageId={page.id} /> : null}
                {(page.connection_type ?? (page.is_mock ? "mock" : "facebook")) === "facebook" && !page.webhook_subscribed ? <SubscribeFacebookWebhookButton pageId={page.id} /> : null}
                {page.webhook_subscribed ? <StatusBadge status="Webhook subscribed" /> : null}
                {(page.connection_type ?? (page.is_mock ? "mock" : "facebook")) === "facebook" ? <DisconnectFacebookPageButton pageId={page.id} /> : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="No Facebook Pages yet">
          <div className="flex flex-wrap justify-center gap-3">
            <ConnectFacebookButton disabled={!realModeEnabled} />
          </div>
        </Empty>
      )}
    </div>
  );
}
