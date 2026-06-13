import { PageShell } from "@/frontend/components/common/page-shell";
import { DashboardPostsClient } from "@/frontend/features/dashboard/components/dashboard-posts-client";

export default function PostsPage() {
  return (
    <PageShell title="Posts" description="Browse synced Facebook posts and create automations for each comment scenario.">
      <DashboardPostsClient />
    </PageShell>
  );
}
