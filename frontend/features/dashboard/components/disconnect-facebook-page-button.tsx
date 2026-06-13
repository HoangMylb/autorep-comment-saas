"use client";

import { Button, Checkbox, Modal } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/frontend/lib/api-client";

export function DisconnectFacebookPageButton({ pageId }: { pageId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const response = await apiClient.delete(`/facebook/pages/${pageId}/disconnect`);
      toast.success(response.data.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["facebook-pages"] }),
        queryClient.invalidateQueries({ queryKey: ["facebook-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["automations"] }),
        queryClient.invalidateQueries({ queryKey: ["comment-logs"] })
      ]);
      setOpen(false);
      setConfirmed(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button danger onClick={() => setOpen(true)}>Disconnect & Delete Data</Button>
      <Modal
        title="Disconnect Facebook Page?"
        open={open}
        onOk={handleClick}
        onCancel={() => {
          setOpen(false);
          setConfirmed(false);
        }}
        okText="Disconnect & Delete Data"
        okButtonProps={{ danger: true, disabled: !confirmed, loading }}
      >
        <div className="space-y-4">
          <p>
            This will remove this Page connection, synced posts, automations, and logs from AutoRep. Your Facebook Page and Facebook posts will not be deleted.
          </p>
          <Checkbox checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)}>
            I understand this only deletes local app data.
          </Checkbox>
        </div>
      </Modal>
    </>
  );
}
