"use client";

import { Table, Tag } from "antd";
import type { Automation } from "@/frontend/types/domain";
import { formatDate } from "@/frontend/lib/utils";

export function AdminAutomationsTable({ automations }: { automations: Automation[] }) {
  return (
    <Table
      rowKey="id"
      dataSource={automations}
      scroll={{ x: 1200 }}
      columns={[
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "User", dataIndex: ["profiles", "email"], key: "user" },
        { title: "Page", dataIndex: ["facebook_pages", "page_name"], key: "page" },
        { title: "Post", dataIndex: ["facebook_posts", "message"], key: "post" },
        { title: "Keywords", dataIndex: "keywords", key: "keywords", render: (value: string[]) => value.map((item) => <Tag key={item}>{item}</Tag>) },
        { title: "Active", dataIndex: "is_active", key: "is_active", render: (value: boolean) => value ? <Tag color="green">Active</Tag> : <Tag>Off</Tag> },
        { title: "Created", dataIndex: "created_at", key: "created_at", render: (value: string) => formatDate(value) }
      ]}
    />
  );
}
