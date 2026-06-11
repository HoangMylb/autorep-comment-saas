import { Tag } from "antd";

export function StatusBadge({ status }: { status: string }) {
  const color = status === "success" ? "green" : status === "failed" ? "red" : status === "connected" ? "blue" : "default";
  return <Tag color={color}>{status}</Tag>;
}
