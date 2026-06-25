import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getInventoryImportBatch } from "../../../../../../lib/clover/import-store";
import { createCloverSyncPlan } from "../../../../../../lib/clover/sync-plan";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const batch = await getInventoryImportBatch(req.params.id);

  if (!batch) {
    res.status(404).json({ error: "Inventory import not found." });
    return;
  }

  const limit = Number(req.query.limit ?? "100");
  const plan = await createCloverSyncPlan(batch, {
    limit: Number.isFinite(limit) ? limit : 100,
  });

  res.json({ plan });
}
