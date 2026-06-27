import { requireApiPermission } from "../../../lib/auth/api-guards";
import { getOpsSnapshot } from "../../../lib/ops/readiness";

export async function GET() {
  const auth = await requireApiPermission("settings.write");
  if (!auth.ok) return auth.response;

  const snapshot = await getOpsSnapshot();

  return Response.json({
    ...snapshot.checks,
    actions: snapshot.actions,
    generatedAt: snapshot.generatedAt,
    readinessScore: snapshot.readinessScore,
    state: snapshot.state,
    summary: snapshot.summary,
  });
}
