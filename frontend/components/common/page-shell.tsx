import { Card } from "antd";
import { cn } from "@/frontend/lib/utils";

export function PageShell({
  title,
  description,
  actions,
  children,
  className
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions}
      </div>
      <Card className="rounded-[28px] border-slate-200">{children}</Card>
    </div>
  );
}
