import { getProfileById } from "@/backend/repositories/profile-repository";
import { getAutomationsByUser } from "@/backend/repositories/automation.repository";
import { getLogsByUser } from "@/backend/repositories/comment-log.repository";
import { getPagesByUser } from "@/backend/repositories/facebook-page.repository";

export async function getDashboardOverview(userId: string) {
  const [profile, pages, automations, logs] = await Promise.all([
    getProfileById(userId),
    getPagesByUser(userId),
    getAutomationsByUser(userId),
    getLogsByUser(userId, {})
  ]);

  return {
    stats: {
      admins: profile?.role === "admin" ? 1 : 0,
      activeUsers: profile?.status === "active" ? 1 : 0,
      blockedUsers: profile?.status === "blocked" ? 1 : 0,
      totalPages: pages.length,
      totalAutomations: automations.length,
      totalLogs: logs.length
    },
    recentLogs: logs.slice(0, 5)
  };
}
