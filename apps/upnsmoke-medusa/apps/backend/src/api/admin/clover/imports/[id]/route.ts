import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getInventoryImportBatch } from "../../../../../lib/clover/import-store";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const batch = await getInventoryImportBatch(req.params.id);

  if (!batch) {
    res.status(404).json({ error: "Inventory import not found." });
    return;
  }

  res.json({ batch });
}
