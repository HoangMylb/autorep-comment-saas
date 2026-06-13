"use client";

import { Button } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/frontend/lib/api-client";

export function SyncFacebookPostsButton({ pageId }: { pageId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleClick = async () => {
    try {
      const response = await apiClient.post(`/facebook/pages/${pageId}/sync-posts`);
      toast.success(response.data.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["facebook-pages"] }),
        queryClient.invalidateQueries({ queryKey: ["facebook-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["automations"] })
      ]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sync posts");
    }
  };

  return <Button onClick={handleClick}>Sync Posts</Button>;
}
