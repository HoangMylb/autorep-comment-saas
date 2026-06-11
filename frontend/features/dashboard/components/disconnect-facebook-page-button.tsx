"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/frontend/lib/api-client";

export function DisconnectFacebookPageButton({ pageId }: { pageId: string }) {
  const router = useRouter();

  const handleClick = async () => {
    try {
      const response = await apiClient.post(`/facebook/pages/${pageId}/disconnect`);
      toast.success(response.data.message);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect page");
    }
  };

  return <Button danger onClick={handleClick}>Disconnect</Button>;
}
