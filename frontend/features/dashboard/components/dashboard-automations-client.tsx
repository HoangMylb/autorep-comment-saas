"use client";

import { Empty } from "antd";
import { useAppQuery } from "@/frontend/hooks/use-app-query";
import { AutomationsTable } from "@/frontend/features/dashboard/components/automations-table";
import type { AutomationsPayload } from "@/frontend/types/api";

export function DashboardAutomationsClient() {
  const { data, isLoading } = useAppQuery<AutomationsPayload>(["automations"], "/automations", 45_000);
  const automations = data?.automations ?? [];

  if (isLoading) {
    return <div className="rounded-[28px] border border-slate-200 p-6">Loading automations…</div>;
  }

  return automations.length ? <AutomationsTable automations={automations} /> : <Empty description="No automations yet" />;
}
