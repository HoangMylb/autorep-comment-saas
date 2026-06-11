import type { Automation, CommentLog, FacebookPage, FacebookPost, OverviewStats, Profile } from "@/frontend/types/domain";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface AuthPayload {
  redirectTo: string;
  email: string;
}

export interface DashboardPayload {
  stats: OverviewStats;
  recentLogs?: CommentLog[];
}

export interface MePayload {
  profile: Profile | null;
}

export interface AdminOverviewPayload {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalAdmins: number;
  totalPages: number;
  totalAutomations: number;
  totalLogs: number;
}

export interface PagesPayload {
  pages: FacebookPage[];
}

export interface PostsPayload {
  posts: FacebookPost[];
}

export interface AutomationsPayload {
  automations: Automation[];
}

export interface LogsPayload {
  logs: CommentLog[];
}
