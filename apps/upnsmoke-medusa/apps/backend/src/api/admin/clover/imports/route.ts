import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { parseInventoryImportFile } from "../../../../lib/clover/import-parser";
import {
  createInventoryImportBatch,
  listInventoryImportBatches,
} from "../../../../lib/clover/import-store";

type ImportRequestBody = {
  contentBase64?: string;
  fileName?: string;
};

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const batches = await listInventoryImportBatches();

  res.json({
    batches: batches.map((batch) => ({
      dryRun: batch.dryRun,
      fileName: batch.fileName,
      id: batch.id,
      importedAt: batch.importedAt,
      previewRows: batch.rows.slice(0, 10),
      source: batch.source,
      status: batch.status,
      summary: batch.summary,
    })),
  });
}

export async function POST(
  req: MedusaRequest<ImportRequestBody>,
  res: MedusaResponse,
) {
  const fileName = req.body.fileName?.trim();
  const contentBase64 = req.body.contentBase64?.trim();

  if (!fileName || !contentBase64) {
    res.status(400).json({
      error: "fileName and contentBase64 are required.",
    });
    return;
  }

  if (!/\.(csv|xlsx)$/i.test(fileName)) {
    res.status(400).json({
      error: "Only CSV and XLSX inventory uploads are supported.",
    });
    return;
  }

  const parsed = await parseInventoryImportFile(fileName, contentBase64);
  const batch = await createInventoryImportBatch(parsed);

  res.json({
    batch: {
      dryRun: batch.dryRun,
      fileName: batch.fileName,
      id: batch.id,
      importedAt: batch.importedAt,
      previewRows: batch.rows.slice(0, 25),
      source: batch.source,
      status: batch.status,
      summary: batch.summary,
    },
  });
}
