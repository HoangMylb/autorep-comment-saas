"use client";

import { Table, Tag } from "antd";
import type { FacebookPage } from "@/frontend/types/domain";
import { formatDate } from "@/frontend/lib/utils";

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
        { title: "Mock", dataIndex: "is_mock", key: "is_mock", render: (value: boolean) => value ? <Tag color="purple">Mock</Tag> : <Tag>Live</Tag> },
        { title: "Status", dataIndex: "status", key: "status" },
        { title: "Connected", dataIndex: "connected_at", key: "connected_at", render: (value: string) => formatDate(value) }
      ]}
    />
  );
}
