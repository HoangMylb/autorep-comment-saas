"use client";

import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CommentLog } from "@/frontend/types/domain";
import { formatDate } from "@/frontend/lib/utils";
import { StatusBadge } from "@/frontend/features/dashboard/components/status-badge";

const columns: ColumnsType<CommentLog> = [
  { title: "Source", dataIndex: "source", key: "source", render: (value: string | undefined) => value ? <StatusBadge status={value} /> : <Tag>-</Tag> },
  { title: "Processing", dataIndex: "processing_status", key: "processing_status", render: (value: string | undefined) => value ? <StatusBadge status={value} /> : <Tag>-</Tag> },
  { title: "Commenter", dataIndex: "commenter_name", key: "commenter_name" },
  { title: "Comment", dataIndex: "comment_message", key: "comment_message" },
  { title: "Keyword", dataIndex: "matched_keyword", key: "matched_keyword", render: (value: string | null) => value ?? "-" },
  { title: "Inbox", dataIndex: "inbox_status", key: "inbox_status", render: (value: string) => <StatusBadge status={value} /> },
  { title: "Public reply", dataIndex: "public_reply_status", key: "public_reply_status", render: (value: string) => <StatusBadge status={value} /> },
  { title: "Error", dataIndex: "error_message", key: "error_message", render: (value: string | null) => value ? <span className="text-red-500">{value}</span> : "-" },
  { title: "Created", dataIndex: "created_at", key: "created_at", render: (value: string) => formatDate(value) }
];

export function LogsTable({ logs }: { logs: CommentLog[] }) {
  return <Table rowKey="id" columns={columns} dataSource={logs} scroll={{ x: 1100 }} />;
}
