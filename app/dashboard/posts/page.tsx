import { Button, Card } from "antd";
import { requireUser } from "@/backend/lib/auth";
import { getUserPages, getUserPosts } from "@/backend/services/mock-facebook.service";
import { EmptyState } from "@/frontend/components/common/empty-state";
import { PageShell } from "@/frontend/components/common/page-shell";
import { formatDate } from "@/frontend/lib/utils";
import { SendTestCommentModal } from "@/frontend/features/dashboard/components/send-test-comment-modal";
import { SetupDemoButton } from "@/frontend/features/dashboard/components/setup-demo-button";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ pageId?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const pages = await getUserPages(user.id);
  const pageId = params.pageId ?? pages[0]?.id;
  const posts = pageId ? await getUserPosts(user.id, pageId) : [];

  return (
    <PageShell title="Posts" description="Browse demo posts from your mock Facebook Page and create automations for each comment scenario.">
      {posts.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.id} className="rounded-[28px] border-slate-200">
              <p className="text-sm text-slate-500">{post.facebook_pages?.page_name ?? "Page"}</p>
              <p className="mt-2 text-base text-slate-700">{post.message}</p>
              <p className="mt-3 text-sm text-slate-500">Created: {formatDate(post.created_time ?? post.created_at)}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="primary" href={`/dashboard/automations/new?postId=${post.id}`}>Create Automation</Button>
                <Button href={`/dashboard/automations?postId=${post.id}`}>View Automations</Button>
                <SendTestCommentModal facebookPostId={post.id} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No posts available" description="Create the demo page first, then return here to choose a post for automation." action={{ label: "Use Demo Facebook Page", render: <SetupDemoButton /> }} />
      )}
    </PageShell>
  );
}
