import { listProfiles, updateProfileStatus } from "@/backend/repositories/profile-repository";
import { getAllAutomationsForAdmin } from "@/backend/repositories/automation.repository";
import { getAllLogsForAdmin } from "@/backend/repositories/comment-log.repository";
import { getAllPagesForAdmin } from "@/backend/repositories/facebook-page.repository";

export async function getAdminOverview() {
  const [users, pages, automations, logs] = await Promise.all([
    listProfiles(),
    getAllPagesForAdmin(),
    getAllAutomationsForAdmin(),
    getAllLogsForAdmin({})
  ]);

  return {
    totalUsers: users.length,
    activeUsers: users.filter((item) => item.status === "active").length,
    blockedUsers: users.filter((item) => item.status === "blocked").length,
    totalAdmins: users.filter((item) => item.role === "admin").length,
    totalPages: pages.length,
    totalAutomations: automations.length,
    totalLogs: logs.length
  };
}

export async function getAdminUsers() {
  return listProfiles();
}

export async function changeUserStatus(userId: string, status: "active" | "blocked") {
  return updateProfileStatus(userId, status);
}
