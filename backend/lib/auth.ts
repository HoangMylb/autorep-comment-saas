import { createClient } from "@/frontend/lib/supabase/server";
import { getProfileById } from "@/backend/repositories/profile-repository";
import type { RequestUser } from "@/backend/types";

export async function getRequestUser(): Promise<RequestUser | null> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await getProfileById(user.id);
  const role = (profile?.role ?? user.app_metadata.role ?? user.user_metadata.role ?? "user") as "admin" | "user";
  const status = (profile?.status ?? "active") as "active" | "blocked";

  return {
    id: user.id,
    email: user.email,
    role,
    status
  };
}

export async function requireUser() {
  const user = await getRequestUser();
  if (!user || user.status !== "active") {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}
