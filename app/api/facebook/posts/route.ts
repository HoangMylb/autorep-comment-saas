import { NextRequest } from "next/server";
import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { getUserPosts } from "@/backend/services/facebook-post.service";

export async function GET(request: NextRequest) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const pageId = request.nextUrl.searchParams.get("pageId");
    if (!pageId) throw new Error("pageId is required");
    const posts = await getUserPosts(user.id, pageId);
    return { posts };
  });
}
