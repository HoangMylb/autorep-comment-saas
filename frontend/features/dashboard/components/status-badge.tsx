import { Tag } from "antd";

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === "success"
      ? "green"
      : status === "failed" || status === "failed_permission" || status === "expired" || status === "error"
        ? "red"
        : status === "connected" || status === "processed"
          ? "blue"
          : status === "processed_with_errors"
            ? "orange"
          : status === "mock"
            ? "purple"
            : status === "facebook"
              ? "cyan"
              : status === "skipped"
                ? "gold"
                : status === "active"
                  ? "green"
                  : status === "stale" || status === "stale automation"
                    ? "volcano"
                  : status === "inactive" || status === "disconnected"
                    ? "default"
                    : "default";
  return <Tag color={color}>{status}</Tag>;
}
