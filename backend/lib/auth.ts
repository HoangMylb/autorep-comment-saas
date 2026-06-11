import { createClient } from "@/frontend/lib/supabase/server";
import type { RequestUser } from "@/backend/types";

export async function getRequestUser(): Promise<RequestUser | null> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const role = (user.app_metadata.role ?? user.user_metadata.role ?? "user") as "admin" | "user";
  return {
    id: user.id,
    email: user.email,
    role
  };
}

export async function requireUser() {
  const user = await getRequestUser();
  if (!user) {
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
