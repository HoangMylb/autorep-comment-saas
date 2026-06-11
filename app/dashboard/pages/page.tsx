import { Button, Card } from "antd";
import { requireUser } from "@/backend/lib/auth";
import { getUserPages } from "@/backend/services/mock-facebook.service";
import { EmptyState } from "@/frontend/components/common/empty-state";
import { PageShell } from "@/frontend/components/common/page-shell";
import { StatusBadge } from "@/frontend/features/dashboard/components/status-badge";

export default async function FacebookPagesPage() {
  const user = await requireUser();
  const pages = await getUserPages(user.id);

  return (
    <PageShell title="Facebook Pages" description="Use demo data to simulate connected pages and start the full automation flow." actions={<Button type="primary" href="/api/mock/facebook/setup-demo">Use Demo Facebook Page</Button>}>
      {pages.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id} className="rounded-[28px] border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{page.page_name}</p>
                  <p className="mt-2 text-sm text-slate-500">{page.page_id}</p>
                </div>
                {page.is_mock ? <StatusBadge status="mock" /> : null}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <StatusBadge status={page.status} />
                <Button href={`/dashboard/posts?pageId=${page.id}`}>View Posts</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No Facebook Pages yet" description="Generate a demo page and posts to test the entire product flow without real Facebook APIs." action={{ label: "Use Demo Facebook Page", href: "/api/mock/facebook/setup-demo" }} />
      )}
    </PageShell>
  );
}
