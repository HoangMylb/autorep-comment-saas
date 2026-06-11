import { Card } from "antd";
import { PageShell } from "@/frontend/components/common/page-shell";
import { getProfileById } from "@/backend/repositories/profile-repository";
import { requireUser } from "@/backend/lib/auth";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfileById(user.id);

  return (
    <PageShell title="Account settings" description="Basic account profile and role information for the current user.">
      <Card className="rounded-[28px] border-slate-200">
        <div className="space-y-3 text-sm text-slate-600">
          <p><span className="font-medium text-slate-900">Email:</span> {profile?.email}</p>
          <p><span className="font-medium text-slate-900">Full name:</span> {profile?.full_name ?? "-"}</p>
          <p><span className="font-medium text-slate-900">Role:</span> {profile?.role}</p>
          <p><span className="font-medium text-slate-900">Status:</span> {profile?.status}</p>
          <p><span className="font-medium text-slate-900">Foundation status:</span> Dashboard access and role-based guard are active.</p>
        </div>
      </Card>
    </PageShell>
  );
}
