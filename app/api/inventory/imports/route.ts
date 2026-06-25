import { requireApiPermission } from "../../../lib/auth/api-guards";
import { parseInventoryImportFile } from "../../../lib/inventory/import-parser";
import {
  createInventoryImportBatch,
  listInventoryImportBatches,
} from "../../../lib/inventory/import-store";
import { medusaOpsFetch } from "../../../lib/medusa/ops";

export async function GET() {
  const auth = await requireApiPermission("inventory.read");
  if (!auth.ok) return auth.response;

  const batches = await listInventoryImportBatches();
  const medusaResponse = await medusaOpsFetch("/admin/clover/imports");

  if (medusaResponse) {
    const result = await medusaResponse.json();

    return Response.json(result, { status: medusaResponse.status });
  }

  return Response.json({
    batches: batches.map((batch) => ({
      id: batch.id,
      fileName: batch.fileName,
      importedAt: batch.importedAt,
      source: batch.source,
      status: batch.status,
      dryRun: batch.dryRun,
      summary: batch.summary,
      previewRows: batch.rows.slice(0, 10),
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireApiPermission("inventory.write");
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json(
      { error: "Upload an XLSX or CSV inventory file." },
      { status: 400 },
    );
  }

  if (!/\.(csv|xlsx)$/i.test(file.name)) {
    return Response.json(
      { error: "Only CSV and XLSX inventory uploads are supported." },
      { status: 400 },
    );
  }

  const medusaResponse = await medusaOpsFetch("/admin/clover/imports", {
    method: "POST",
    body: JSON.stringify({
      contentBase64: Buffer.from(await file.arrayBuffer()).toString("base64"),
      fileName: file.name,
    }),
  });

  if (medusaResponse) {
    const result = await medusaResponse.json();

    return Response.json(result, { status: medusaResponse.status });
  }

  const parsed = await parseInventoryImportFile(
    file.name,
    await file.arrayBuffer(),
  );
  const batch = await createInventoryImportBatch(parsed);

  return Response.json({
    batch: {
      id: batch.id,
      fileName: batch.fileName,
      importedAt: batch.importedAt,
      source: batch.source,
      status: batch.status,
      dryRun: batch.dryRun,
      summary: batch.summary,
      previewRows: batch.rows.slice(0, 25),
    },
  });
}
