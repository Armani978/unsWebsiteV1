import { requireApiPermission } from "../../../../../lib/auth/api-guards";
import { createCloverSyncPlan } from "../../../../../lib/inventory/clover-sync-plan";
import { getInventoryImportBatch } from "../../../../../lib/inventory/import-store";
import { medusaOpsFetch } from "../../../../../lib/medusa/ops";

export async function POST(
  request: Request,
  context: RouteContext<"/api/inventory/imports/[id]/clover-sync-plan">,
) {
  const auth = await requireApiPermission("inventory.write");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "100");
  const medusaResponse = await medusaOpsFetch(
    `/admin/clover/imports/${id}/sync-plan?limit=${Number.isFinite(limit) ? limit : 100}`,
    { method: "POST", body: "{}" },
  );

  if (medusaResponse) {
    const result = await medusaResponse.json();

    return Response.json(result, { status: medusaResponse.status });
  }

  const batch = await getInventoryImportBatch(id);

  if (!batch) {
    return Response.json(
      { error: "Inventory import not found." },
      { status: 404 },
    );
  }

  const plan = await createCloverSyncPlan(batch, {
    limit: Number.isFinite(limit) ? limit : 100,
  });

  return Response.json({ plan });
}
