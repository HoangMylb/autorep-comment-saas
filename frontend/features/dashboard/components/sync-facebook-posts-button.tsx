"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/frontend/lib/api-client";

export function SyncFacebookPostsButton({ pageId }: { pageId: string }) {
  const router = useRouter();

  const handleClick = async () => {
    try {
      const response = await apiClient.post(`/facebook/pages/${pageId}/sync-posts`);
      toast.success(response.data.message);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sync posts");
    }
  };

  return <Button onClick={handleClick}>Sync Posts</Button>;
}
