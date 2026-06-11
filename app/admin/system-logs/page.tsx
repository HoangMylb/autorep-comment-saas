import { requireAdmin } from "@/backend/lib/auth";
import { PageShell } from "@/frontend/components/common/page-shell";
import { Table } from "antd";
import { getSystemLogs } from "@/backend/repositories/system-log.repository";
import { formatDate } from "@/frontend/lib/utils";

export default async function AdminSystemLogsPage() {
  await requireAdmin();
  const logs = await getSystemLogs();

  return (
    <PageShell title="System logs" description="Operational visibility for Facebook OAuth, webhook, and API failures.">
      <Table
        rowKey="id"
        dataSource={logs}
        scroll={{ x: 1000 }}
        columns={[
          { title: "Level", dataIndex: "level", key: "level" },
          { title: "Source", dataIndex: "source", key: "source" },
          { title: "Message", dataIndex: "message", key: "message" },
          { title: "Metadata", dataIndex: "metadata", key: "metadata", render: (value: Record<string, unknown> | null) => value ? JSON.stringify(value) : "-" },
          { title: "Created", dataIndex: "created_at", key: "created_at", render: (value: string) => formatDate(value) }
        ]}
      />
    </PageShell>
  );
}
