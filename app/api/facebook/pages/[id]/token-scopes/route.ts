import { withApiHandler } from "@/backend/middlewares/api-handler";
import { requireUser } from "@/backend/lib/auth";
import { getPageById } from "@/backend/repositories/facebook-page.repository";

const REQUIRED_SCOPES = [
  "pages_manage_engagement",
  "pages_read_user_content",
  "pages_messaging",
  "pages_read_engagement",
  "pages_manage_metadata"
] as const;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return withApiHandler(async () => {
    const user = await requireUser();
    const page = await getPageById(params.id, user.id);
    if (!page) {
      throw new Error("Facebook page not found");
    }

    const grantedPermissions = new Set(Array.isArray(page.permissions) ? page.permissions : []);

    return {
      pageId: page.id,
      facebookPageId: page.page_id,
      scopes: REQUIRED_SCOPES.map((scope) => ({
        name: scope,
        granted: grantedPermissions.has(scope)
      })),
      missingScopes: REQUIRED_SCOPES.filter((scope) => !grantedPermissions.has(scope))
    };
  });
}
