export type UserRole = "admin" | "user";
export type UserStatus = "active" | "blocked";
export type PageStatus = "connected" | "expired" | "disconnected";
export type DeliveryStatus = "success" | "failed" | "failed_permission" | "skipped" | "skipped_duplicate";
export type ConnectionType = "mock" | "facebook" | "simulated_facebook";
export type ProcessingStatus = "processed" | "processed_with_errors" | "skipped" | "failed";
export type SystemLogLevel = "info" | "warning" | "error";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface OverviewStats {
  totalUsers?: number;
  activeUsers?: number;
  blockedUsers?: number;
  admins?: number;
  totalPages?: number;
  totalAutomations?: number;
  totalLogs?: number;
}

export interface FacebookPage {
  id: string;
  user_id: string;
  page_id: string;
  page_name: string;
  page_avatar_url: string | null;
  user_access_token?: string | null;
  page_access_token: string | null;
  token_expires_at?: string | null;
  permissions?: string[];
  connection_type?: ConnectionType;
  last_synced_at?: string | null;
  webhook_subscribed?: boolean;
  webhook_subscribed_at?: string | null;
  error_message?: string | null;
  status: PageStatus;
  is_mock: boolean;
  connected_at: string;
  created_at: string;
  updated_at: string;
  profiles?: { email?: string; full_name?: string | null };
}

export interface FacebookPost {
  id: string;
  user_id: string;
  facebook_page_id: string;
  post_id: string;
  message: string | null;
  image_url?: string | null;
  permalink_url?: string | null;
  created_time?: string | null;
  connection_type?: ConnectionType;
  raw_payload?: Record<string, unknown> | null;
  is_mock: boolean;
   is_stale?: boolean;
   last_seen_at?: string | null;
   facebook_created_time?: string | null;
  created_at: string;
  updated_at: string;
  facebook_pages?: { page_name?: string } | null;
}

export interface Automation {
  id: string;
  user_id: string;
  facebook_page_id: string;
  facebook_post_id: string;
  name: string;
  keywords: string[];
  inbox_message: string;
  public_reply_message: string | null;
  is_active: boolean;
  is_stale?: boolean;
  created_at: string;
  updated_at: string;
  facebook_pages?: { page_name?: string | null; status?: string | null } | null;
  facebook_posts?: { message?: string | null; post_id?: string | null; is_stale?: boolean | null } | null;
  profiles?: { email?: string; full_name?: string | null };
}

export interface CommentLog {
  id: string;
  user_id: string;
  automation_id: string | null;
  facebook_page_id: string | null;
  facebook_post_id: string | null;
  comment_id: string | null;
  commenter_id: string | null;
  commenter_name: string | null;
  comment_message: string | null;
  matched_keyword: string | null;
  inbox_status: DeliveryStatus;
  public_reply_status: DeliveryStatus;
  source?: ConnectionType;
  event_type?: string | null;
  processing_status?: ProcessingStatus;
  error_message: string | null;
  raw_payload?: Record<string, unknown> | null;
  created_at: string;
  automations?: { name?: string } | null;
  facebook_pages?: { page_name?: string } | null;
  facebook_posts?: { message?: string | null } | null;
  profiles?: { email?: string; full_name?: string | null };
}

export interface SystemLog {
  id: string;
  level: SystemLogLevel;
  source: string;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
