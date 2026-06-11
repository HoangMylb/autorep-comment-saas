import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  FACEBOOK_APP_ID: z.string().min(1).optional(),
  FACEBOOK_APP_SECRET: z.string().min(1).optional(),
  FACEBOOK_VERIFY_TOKEN: z.string().min(1).optional(),
  FACEBOOK_GRAPH_API_VERSION: z.string().default("v20.0"),
  ENABLE_FACEBOOK_REAL_MODE: z.coerce.boolean().default(false),
  ENABLE_FACEBOOK_SEND_MESSAGE: z.coerce.boolean().default(false),
  ENABLE_FACEBOOK_PUBLIC_REPLY: z.coerce.boolean().default(false)
});

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  cachedServerEnv = serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    FACEBOOK_VERIFY_TOKEN: process.env.FACEBOOK_VERIFY_TOKEN,
    FACEBOOK_GRAPH_API_VERSION: process.env.FACEBOOK_GRAPH_API_VERSION,
    ENABLE_FACEBOOK_REAL_MODE: process.env.ENABLE_FACEBOOK_REAL_MODE,
    ENABLE_FACEBOOK_SEND_MESSAGE: process.env.ENABLE_FACEBOOK_SEND_MESSAGE,
    ENABLE_FACEBOOK_PUBLIC_REPLY: process.env.ENABLE_FACEBOOK_PUBLIC_REPLY
  });

  return cachedServerEnv;
}
