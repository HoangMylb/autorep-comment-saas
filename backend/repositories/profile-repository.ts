import { createAdminClient } from "@/backend/lib/supabase";

export async function getProfileById(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listProfiles() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateProfileStatus(userId: string, status: "active" | "blocked") {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
