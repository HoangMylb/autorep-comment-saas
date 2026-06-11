"use client";

import { Button, Space, Table, Tag } from "antd";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiClient } from "@/frontend/lib/api-client";

export function AdminUsersTable({ users }: { users: Array<Record<string, unknown>> }) {
  const router = useRouter();

  const updateStatus = async (userId: string, status: "active" | "blocked") => {
    try {
      await apiClient.patch("/admin/users", { userId, status });
      toast.success("User status updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  return (
    <Table
      rowKey="id"
      dataSource={users}
      scroll={{ x: 900 }}
      columns={[
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Full name", dataIndex: "full_name", key: "full_name" },
        { title: "Role", dataIndex: "role", key: "role", render: (value: string) => <Tag color={value === "admin" ? "blue" : "default"}>{value}</Tag> },
        { title: "Status", dataIndex: "status", key: "status", render: (value: string) => <Tag color={value === "active" ? "green" : "red"}>{value}</Tag> },
        {
          title: "Actions",
          key: "actions",
          render: (_, record) => (
            <Space>
              <Button onClick={() => updateStatus(String(record.id), "active")}>Activate</Button>
              <Button danger onClick={() => updateStatus(String(record.id), "blocked")}>Block</Button>
            </Space>
          )
        }
      ]}
    />
  );
}
