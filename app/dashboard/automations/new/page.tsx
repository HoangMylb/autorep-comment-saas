import { requireUser } from "@/backend/lib/auth";
import { getUserPages } from "@/backend/services/facebook-page.service";
import { getUserPosts } from "@/backend/services/facebook-post.service";
import { EmptyState } from "@/frontend/components/common/empty-state";
import { PageShell } from "@/frontend/components/common/page-shell";
import { AutomationForm } from "@/frontend/features/dashboard/components/automation-form";

export default async function CreateAutomationPage() {
  const user = await requireUser();
  const pages = await getUserPages(user.id);
  const posts = pages.length ? (await Promise.all(pages.map((page) => getUserPosts(user.id, page.id)))).flat().filter((post) => !post.is_stale) : [];

  return (
    <PageShell title="Create Automation" description="Select a synced Facebook Page and post, then define keywords and response content.">
      {pages.length && posts.length ? <AutomationForm pages={pages} posts={posts} /> : <EmptyState title="Need Facebook data first" description="Connect a Facebook Page and sync posts before creating an automation." />}
    </PageShell>
  );
}
