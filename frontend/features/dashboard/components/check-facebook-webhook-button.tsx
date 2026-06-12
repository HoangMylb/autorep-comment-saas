"use client";

import { Button } from "antd";
import { toast } from "sonner";
import { apiClient } from "@/frontend/lib/api-client";

export function CheckFacebookWebhookButton({ pageId }: { pageId: string }) {
  const handleClick = async () => {
    try {
      const response = await apiClient.get(`/facebook/pages/${pageId}/webhook-status`);
      const data = response.data.data;
      toast.success(
        `Subscribed: ${data.isCurrentAppSubscribed ? "yes" : "no"} | feed: ${data.hasFeedField ? "yes" : "no"}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to check webhook status");
    }
  };

  return <Button onClick={handleClick}>Check Webhook</Button>;
}
