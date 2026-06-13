import { Card, Skeleton } from "antd";

export function DashboardLoadingShell({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="rounded-[28px] border-slate-200">
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-100 p-4">
            <Skeleton active paragraph={{ rows: 2 }} title={{ width: "40%" }} />
          </div>
        ))}
      </div>
    </Card>
  );
}
