import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/backend/lib/env";

export function createAdminClient() {
  const serverEnv = getServerEnv();
  return createClient(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
