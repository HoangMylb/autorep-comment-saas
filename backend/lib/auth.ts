import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { getServerEnv } from "@/backend/lib/env";
import type { RequestUser } from "@/backend/types";

export async function getRequestUser(): Promise<RequestUser | null> {
  const serverEnv = getServerEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      }
    }
  });

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
