import { requireApiPermission } from "../../../../lib/auth/api-guards";
import { getInventoryImportBatch } from "../../../../lib/inventory/import-store";
import { medusaOpsFetch } from "../../../../lib/medusa/ops";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/inventory/imports/[id]">,
) {
  const auth = await requireApiPermission("inventory.read");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const medusaResponse = await medusaOpsFetch(`/admin/clover/imports/${id}`);

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

  return Response.json({ batch });
}
