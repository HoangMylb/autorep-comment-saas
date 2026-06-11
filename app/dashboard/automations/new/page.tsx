import { requireUser } from "@/backend/lib/auth";
import { getUserPages, getUserPosts } from "@/backend/services/mock-facebook.service";
import { EmptyState } from "@/frontend/components/common/empty-state";
import { PageShell } from "@/frontend/components/common/page-shell";
import { AutomationForm } from "@/frontend/features/dashboard/components/automation-form";

export default async function CreateAutomationPage() {
  const user = await requireUser();
  const pages = await getUserPages(user.id);
  const posts = pages.length ? (await Promise.all(pages.map((page) => getUserPosts(user.id, page.id)))).flat() : [];

  return (
    <PageShell title="Create Automation" description="Select a demo page and post, then define keywords and response content.">
      {pages.length && posts.length ? <AutomationForm pages={pages} posts={posts} /> : <EmptyState title="Need demo data first" description="Generate a demo Facebook Page and posts before creating an automation." action={{ label: "Use Demo Facebook Page", href: "/api/mock/facebook/setup-demo" }} />}
    </PageShell>
  );
}
