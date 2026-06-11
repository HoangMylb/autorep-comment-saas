"use client";

import { Table, Tag } from "antd";
import type { FacebookPage } from "@/frontend/types/domain";
import { formatDate } from "@/frontend/lib/utils";
import { StatusBadge } from "@/frontend/features/dashboard/components/status-badge";

export function AdminPagesTable({ pages }: { pages: FacebookPage[] }) {
  return (
    <Table
      rowKey="id"
      dataSource={pages}
      scroll={{ x: 1000 }}
      columns={[
        { title: "Page", dataIndex: "page_name", key: "page_name" },
        { title: "Page ID", dataIndex: "page_id", key: "page_id" },
        { title: "Owner", dataIndex: ["profiles", "email"], key: "owner" },
        { title: "Connection", dataIndex: "connection_type", key: "connection_type", render: (value: string | undefined, record: FacebookPage) => <StatusBadge status={value ?? (record.is_mock ? "mock" : "facebook")} /> },
        { title: "Status", dataIndex: "status", key: "status", render: (value: string) => <StatusBadge status={value} /> },
        { title: "Last Synced", dataIndex: "last_synced_at", key: "last_synced_at", render: (value: string | null) => value ? formatDate(value) : "-" },
        { title: "Connected", dataIndex: "connected_at", key: "connected_at", render: (value: string) => formatDate(value) },
        { title: "Error", dataIndex: "error_message", key: "error_message", render: (value: string | null) => value ?? "-" }
      ]}
    />
  );
}
