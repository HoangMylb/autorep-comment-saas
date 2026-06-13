"use client";

import { Button, Card, Empty, Select } from "antd";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useAppQuery } from "@/frontend/hooks/use-app-query";
import { formatDate } from "@/frontend/lib/utils";
import { StatusBadge } from "@/frontend/features/dashboard/components/status-badge";
import type { PagesPayload, PostsPayload } from "@/frontend/types/api";

export function DashboardPostsClient() {
  const searchParams = useSearchParams();
  const { data: pageData, isLoading: pagesLoading } = useAppQuery<PagesPayload>(["facebook-pages"], "/facebook/pages", 60_000);
  const pages = pageData?.pages ?? [];
  const selectedPageId = searchParams.get("pageId") ?? pages[0]?.id ?? "";
  const postsUrl = selectedPageId ? `/facebook/posts?pageId=${selectedPageId}` : "";
  const { data: postData, isLoading: postsLoading } = useAppQuery<PostsPayload>(["facebook-posts", selectedPageId], postsUrl || "/facebook/posts?pageId=missing", 45_000);
  const posts = useMemo(() => postData?.posts ?? [], [postData]);

  if (pagesLoading || postsLoading) {
    return <Card className="rounded-[28px] border-slate-200">Loading posts…</Card>;
  }

  return (
    <div className="space-y-4">
      {pages.length ? (
        <Select className="w-full max-w-md" value={selectedPageId} options={pages.map((page) => ({ label: page.page_name, value: page.id }))} onChange={(value) => window.location.assign(`/dashboard/posts?pageId=${value}`)} />
      ) : null}
      {posts.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.id} className="rounded-[28px] border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{post.facebook_pages?.page_name ?? "Page"}</p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={post.connection_type ?? (post.is_mock ? "mock" : "facebook")} />
                  {post.is_stale ? <StatusBadge status="stale" /> : null}
                </div>
              </div>
              <p className="mt-2 text-base text-slate-700">{post.message}</p>
              <p className="mt-2 text-xs text-slate-500">Facebook Post ID: {post.post_id}</p>
              <p className="mt-3 text-sm text-slate-500">Created: {formatDate(post.facebook_created_time ?? post.created_time ?? post.created_at)}</p>
              <p className="mt-2 text-sm text-slate-500">Last seen: {post.last_seen_at ? formatDate(post.last_seen_at) : "-"}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="primary" href={`/dashboard/automations/new?postId=${post.id}`}>Create Automation</Button>
                <Button href={`/dashboard/automations?postId=${post.id}`}>View Automations</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="No posts available" />
      )}
    </div>
  );
}
