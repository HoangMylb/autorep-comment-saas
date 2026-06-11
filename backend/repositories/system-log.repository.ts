import { createAdminClient } from "@/backend/lib/supabase";

export async function createSystemLog(input: {
  level: "info" | "warning" | "error";
  source: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("system_logs").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function getSystemLogs() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("system_logs").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
