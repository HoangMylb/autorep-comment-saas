"use client";

import { Button } from "antd";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/frontend/lib/api-client";

export function SetupDemoButton({ label = "Use Demo Facebook Page", type = "primary" as const }: { label?: string; type?: "primary" | "default" }) {
  const router = useRouter();

  const handleClick = async () => {
    try {
      const response = await apiClient.post("/mock/facebook/setup-demo");
      toast.success(response.data.message);
      router.replace("/dashboard/pages");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set up demo data");
    }
  };

  return (
    <Button type={type} onClick={handleClick}>
      {label}
    </Button>
  );
}
