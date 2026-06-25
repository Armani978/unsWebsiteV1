import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  InventoryImportBatch,
  InventoryImportRow,
  InventoryImportSummary,
} from "./import-types";

const DATA_DIR = path.join(process.cwd(), ".data", "clover-imports");
const DATA_FILE = path.join(DATA_DIR, "batches.json");

async function readBatches(): Promise<InventoryImportBatch[]> {
  try {
    const contents = await readFile(DATA_FILE, "utf8");
    return JSON.parse(contents) as InventoryImportBatch[];
  } catch {
    return [];
  }
}

async function writeBatches(batches: InventoryImportBatch[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(batches, null, 2));
}

export async function createInventoryImportBatch(input: {
  fileName: string;
  rows: InventoryImportRow[];
  summary: InventoryImportSummary;
}) {
  const batch: InventoryImportBatch = {
    dryRun: true,
    fileName: input.fileName,
    id: randomUUID(),
    importedAt: new Date().toISOString(),
    rows: input.rows,
    source: "api",
    status: "imported",
    summary: input.summary,
  };
  const batches = await readBatches();

  await writeBatches([batch, ...batches]);
  return batch;
}

export async function listInventoryImportBatches() {
  return (await readBatches()).slice(0, 50);
}

export async function getInventoryImportBatch(id: string) {
  const batches = await readBatches();
  return batches.find((batch) => batch.id === id) ?? null;
}
