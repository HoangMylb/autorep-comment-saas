"use client";

import { Card } from "antd";
import { useAppQuery } from "@/frontend/hooks/use-app-query";
import type { MePayload } from "@/frontend/types/api";

export function DashboardSettingsClient() {
  const { data, isLoading } = useAppQuery<MePayload>(["me"], "/me", 60_000);
  const profile = data?.profile;

  if (isLoading) {
    return <Card className="rounded-[28px] border-slate-200">Loading account settings…</Card>;
  }

  return (
    <Card className="rounded-[28px] border-slate-200">
      <div className="space-y-3 text-sm text-slate-600">
        <p><span className="font-medium text-slate-900">Email:</span> {profile?.email}</p>
        <p><span className="font-medium text-slate-900">Full name:</span> {profile?.full_name ?? "-"}</p>
        <p><span className="font-medium text-slate-900">Role:</span> {profile?.role}</p>
        <p><span className="font-medium text-slate-900">Status:</span> {profile?.status}</p>
        <p><span className="font-medium text-slate-900">Foundation status:</span> Dashboard access and role-based guard are active.</p>
      </div>
    </Card>
  );
}
