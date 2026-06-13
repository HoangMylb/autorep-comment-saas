"use client";

import { Card, Empty } from "antd";
import { useSearchParams } from "next/navigation";
import { useAppQuery } from "@/frontend/hooks/use-app-query";
import { LogsTable } from "@/frontend/features/dashboard/components/logs-table";
import type { AutomationsPayload, LogsPayload } from "@/frontend/types/api";

export function DashboardLogsClient() {
  const searchParams = useSearchParams();
  const query = new URLSearchParams(searchParams.toString()).toString();
  const logsUrl = `/comment-logs${query ? `?${query}` : ""}`;
  const { data: logsData, isLoading } = useAppQuery<LogsPayload>(["comment-logs", query], logsUrl, 10_000);
  const { data: automationsData } = useAppQuery<AutomationsPayload>(["automations"], "/automations", 45_000);
  const logs = logsData?.logs ?? [];
  const automations = automationsData?.automations ?? [];

  if (isLoading) {
    return <Card className="rounded-[28px] border-slate-200">Loading logs…</Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-[20px] border-slate-200 text-sm text-slate-500">
        Active filters - source: {searchParams.get("source") ?? "all"}, processing: {searchParams.get("processing_status") ?? "all"}, status: {searchParams.get("status") ?? "all"}
      </Card>
      {logs.length ? <LogsTable logs={logs} /> : <Empty description={`Create an automation${automations.length ? " and send a test comment" : " after generating demo data"} to see delivery results here.`} />}
    </div>
  );
}
