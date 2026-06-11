"use client";

import { useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/frontend/lib/api-client";
import type { ApiResponse } from "@/frontend/types/api";

export function SendTestCommentModal({ facebookPostId, buttonLabel = "Send test comment" }: { facebookPostId: string; buttonLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<{ commenter_name: string; comment_message: string }>();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const response = await apiClient.post<ApiResponse<{ matchedKeyword: string | null }>>("/mock/facebook/send-test-comment", {
        facebook_post_id: facebookPostId,
        ...values
      });
      const matchedKeyword = response.data.data.matchedKeyword;
      toast.success(matchedKeyword ? `Matched keyword: ${matchedKeyword}` : "No keyword matched");
      setOpen(false);
      form.resetFields();
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>{buttonLabel}</Button>
      <Modal title="Send Test Comment" open={open} onOk={handleSubmit} onCancel={() => setOpen(false)} confirmLoading={loading}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Commenter name" name="commenter_name" rules={[{ required: true, message: "Commenter name is required" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Comment message" name="comment_message" rules={[{ required: true, message: "Comment message is required" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
