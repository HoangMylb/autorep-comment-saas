import { z } from "zod";

function normalizeKeywords(keywords: string[]) {
  return Array.from(
    new Set(
      keywords
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    )
  );
}

export const automationInputSchema = z.object({
  facebook_page_id: z.string().uuid(),
  facebook_post_id: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required"),
  keywords: z.array(z.string()).transform(normalizeKeywords).refine((value) => value.length > 0, "At least one keyword is required"),
  inbox_message: z.string().trim().min(1, "Inbox message is required"),
  public_reply_message: z.string().trim().optional().nullable(),
  is_active: z.boolean()
});

export const sendTestCommentSchema = z.object({
  facebook_post_id: z.string().uuid(),
  commenter_name: z.string().trim().min(1, "Commenter name is required"),
  comment_message: z.string().trim().min(1, "Comment message is required")
});

export const logFiltersSchema = z.object({
  status: z.enum(["success", "failed", "skipped"]).optional(),
  keyword: z.string().trim().optional(),
  automation: z.string().uuid().optional(),
  page: z.string().uuid().optional(),
  post: z.string().uuid().optional(),
  source: z.string().trim().optional(),
  processing: z.string().trim().optional(),
  limit: z.coerce.number().int().positive().max(200).optional()
});
