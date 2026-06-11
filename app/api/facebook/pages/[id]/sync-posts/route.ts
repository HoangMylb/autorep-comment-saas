import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { syncPagePosts } from "@/backend/services/facebook-post-sync.service";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const result = await syncPagePosts(user.id, params.id);
    return {
      count: result.count,
      page: result.page,
      posts: result.posts
    };
  });
}
