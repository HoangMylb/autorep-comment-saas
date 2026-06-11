import { createSystemLog } from "@/backend/repositories/system-log.repository";

export function maskSensitiveToken(token: string | null | undefined) {
  if (!token) return null;
  if (token.length <= 8) return "********";
  return `${token.slice(0, 4)}********${token.slice(-4)}`;
}

export async function logFacebookSystemEvent(input: {
  level: "info" | "warning" | "error";
  source: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}) {
  try {
    return await createSystemLog({
      level: input.level,
      source: input.source,
      message: input.message,
      metadata: input.metadata ?? null
    });
  } catch {
    return null;
  }
}
