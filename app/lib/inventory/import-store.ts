import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type {
  InventoryImportBatch,
  InventoryImportRow,
  InventoryImportSummary,
} from "./import-types";

const LOCAL_DATA_DIR = path.join(process.cwd(), ".data", "inventory-imports");
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, "batches.json");

type BatchRecord = {
  id: string;
  file_name: string;
  imported_at: string;
  source: InventoryImportBatch["source"];
  status: InventoryImportBatch["status"];
  dry_run: boolean;
  summary: InventoryImportSummary;
  rows: InventoryImportRow[];
};

function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim();
}

function toBatch(record: BatchRecord): InventoryImportBatch {
  return {
    id: record.id,
    fileName: record.file_name,
    importedAt: record.imported_at,
    source: record.source,
    status: record.status,
    dryRun: record.dry_run,
    summary: record.summary,
    rows: record.rows,
  };
}

async function readLocalBatches(): Promise<InventoryImportBatch[]> {
  try {
    const contents = await readFile(LOCAL_DATA_FILE, "utf8");
    return JSON.parse(contents) as InventoryImportBatch[];
  } catch {
    return [];
  }
}

async function writeLocalBatches(batches: InventoryImportBatch[]) {
  await mkdir(LOCAL_DATA_DIR, { recursive: true });
  await writeFile(LOCAL_DATA_FILE, JSON.stringify(batches, null, 2));
}

async function getSql() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;

  const sql = neon(databaseUrl);
  await sql`
    CREATE TABLE IF NOT EXISTS inventory_import_batches (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      imported_at TIMESTAMPTZ NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      dry_run BOOLEAN NOT NULL DEFAULT TRUE,
      summary JSONB NOT NULL,
      rows JSONB NOT NULL
    )
  `;

  return sql;
}

export async function createInventoryImportBatch(input: {
  fileName: string;
  rows: InventoryImportRow[];
  summary: InventoryImportSummary;
  source?: InventoryImportBatch["source"];
}) {
  const batch: InventoryImportBatch = {
    id: randomUUID(),
    fileName: input.fileName,
    importedAt: new Date().toISOString(),
    source: input.source ?? "upload",
    status: "imported",
    dryRun: true,
    summary: input.summary,
    rows: input.rows,
  };
  const sql = await getSql();

  if (sql) {
    await sql`
      INSERT INTO inventory_import_batches (
        id,
        file_name,
        imported_at,
        source,
        status,
        dry_run,
        summary,
        rows
      )
      VALUES (
        ${batch.id},
        ${batch.fileName},
        ${batch.importedAt},
        ${batch.source},
        ${batch.status},
        ${batch.dryRun},
        ${JSON.stringify(batch.summary)}::jsonb,
        ${JSON.stringify(batch.rows)}::jsonb
      )
    `;
    return batch;
  }

  const batches = await readLocalBatches();
  await writeLocalBatches([batch, ...batches]);
  return batch;
}

export async function listInventoryImportBatches() {
  const sql = await getSql();

  if (sql) {
    const rows = await sql`
      SELECT
        id,
        file_name,
        imported_at,
        source,
        status,
        dry_run,
        summary,
        rows
      FROM inventory_import_batches
      ORDER BY imported_at DESC
      LIMIT 20
    `;

    return rows.map((row) =>
      toBatch({
        id: row.id as string,
        file_name: row.file_name as string,
        imported_at: new Date(row.imported_at as string).toISOString(),
        source: row.source as InventoryImportBatch["source"],
        status: row.status as InventoryImportBatch["status"],
        dry_run: Boolean(row.dry_run),
        summary: row.summary as InventoryImportSummary,
        rows: row.rows as InventoryImportRow[],
      }),
    );
  }

  return readLocalBatches();
}

export async function getInventoryImportBatch(id: string) {
  const sql = await getSql();

  if (sql) {
    const rows = await sql`
      SELECT
        id,
        file_name,
        imported_at,
        source,
        status,
        dry_run,
        summary,
        rows
      FROM inventory_import_batches
      WHERE id = ${id}
      LIMIT 1
    `;
    const row = rows[0];

    if (!row) return null;

    return toBatch({
      id: row.id as string,
      file_name: row.file_name as string,
      imported_at: new Date(row.imported_at as string).toISOString(),
      source: row.source as InventoryImportBatch["source"],
      status: row.status as InventoryImportBatch["status"],
      dry_run: Boolean(row.dry_run),
      summary: row.summary as InventoryImportSummary,
      rows: row.rows as InventoryImportRow[],
    });
  }

  const batches = await readLocalBatches();
  return batches.find((batch) => batch.id === id) ?? null;
}
