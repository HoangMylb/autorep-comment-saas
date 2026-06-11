import { Button } from "antd";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void; render?: ReactNode };
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-lg text-sm text-slate-500">{description}</p>
      {action ? (
        action.render ? (
          <div className="mt-4">{action.render}</div>
        ) : (
          <Button type="primary" href={action.href} onClick={action.onClick} className="mt-4">
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}
