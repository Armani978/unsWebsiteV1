import { requireApiPermission } from "../../../lib/auth/api-guards";
import { getOpsSnapshot } from "../../../lib/ops/readiness";

export async function GET() {
  const auth = await requireApiPermission("settings.write");
  if (!auth.ok) return auth.response;

  return Response.json(await getOpsSnapshot());
}
