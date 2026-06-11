import { requireUser } from "@/backend/lib/auth";
import { getAutomationRecord, getUserPages, getUserPosts } from "@/backend/services/mock-facebook.service";
import { PageShell } from "@/frontend/components/common/page-shell";
import { AutomationForm } from "@/frontend/features/dashboard/components/automation-form";

export default async function EditAutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const pages = await getUserPages(user.id);
  const posts = pages.length ? (await Promise.all(pages.map((page) => getUserPosts(user.id, page.id)))).flat() : [];
  const automation = await getAutomationRecord(user.id, id);

  return (
    <PageShell title="Edit Automation" description="Update keywords, responses, or activation status for this demo automation.">
      <AutomationForm pages={pages} posts={posts} initialValue={automation} />
    </PageShell>
  );
}
