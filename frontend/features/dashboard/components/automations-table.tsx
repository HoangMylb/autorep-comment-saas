"use client";

import { Button, Modal, Space, Switch, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Automation } from "@/frontend/types/domain";
import { apiClient } from "@/frontend/lib/api-client";
import { formatDate } from "@/frontend/lib/utils";
import { StatusBadge } from "@/frontend/features/dashboard/components/status-badge";

export function AutomationsTable({ automations }: { automations: Automation[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDelete = (automation: Automation) => {
    Modal.confirm({
      title: "Delete automation",
      content: `Delete ${automation.name}?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await apiClient.delete(`/automations/${automation.id}`);
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["automations"] }),
            queryClient.invalidateQueries({ queryKey: ["comment-logs"] })
          ]);
          toast.success("Automation deleted");
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Delete failed");
        }
      }
    });
  };

  const handleToggle = async (automation: Automation) => {
    if (automation.is_stale) {
      toast.error("Cannot activate stale automation. Reconnect the page or re-sync posts first.");
      return;
    }

    try {
      await apiClient.patch(`/automations/${automation.id}/toggle`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["automations"] }),
        queryClient.invalidateQueries({ queryKey: ["comment-logs"] })
      ]);
      toast.success("Automation updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Toggle failed");
    }
  };

  const columns: ColumnsType<Automation> = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Page",
      dataIndex: ["facebook_pages", "page_name"],
      key: "page",
      render: (value: string | null | undefined, record: Automation) => (
        <div className="space-y-1">
          <div>{value ?? "Missing page"}</div>
          {record.is_stale ? <StatusBadge status="stale automation" /> : null}
        </div>
      )
    },
    {
      title: "Post",
      dataIndex: ["facebook_posts", "message"],
      key: "post",
      render: (value: string | null, record: Automation) => (
        <div className="space-y-1">
          <div>{value ?? "Missing post"}</div>
          <div className="text-xs text-slate-500">Post ID: {record.facebook_posts?.post_id ?? "-"}</div>
        </div>
      )
    },
    { title: "Keywords", dataIndex: "keywords", key: "keywords", render: (value: string[]) => <div className="flex flex-wrap gap-2">{value.map((item) => <Tag key={item}>{item}</Tag>)}</div> },
    { title: "Active", dataIndex: "is_active", key: "is_active", render: (_value: boolean, record) => <Switch checked={record.is_active} onChange={() => handleToggle(record)} disabled={record.is_stale} /> },
    { title: "Created", dataIndex: "created_at", key: "created_at", render: (value: string) => formatDate(value) },
    {
      title: "Actions",
      key: "actions",
      render: (_value, record) => (
        <Space wrap>
          <Button onClick={() => router.push(`/dashboard/automations/${record.id}/edit`)}>Edit</Button>
          <Button onClick={() => router.push(`/dashboard/logs?automation=${record.id}`)}>View logs</Button>
          <Button danger onClick={() => handleDelete(record)}>Delete</Button>
        </Space>
      )
    }
  ];

  return <Table rowKey="id" columns={columns} dataSource={automations} scroll={{ x: 1200 }} />;
}
