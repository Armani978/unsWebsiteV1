import ExcelJS from "exceljs";
import { toCloverSafeCategory } from "./category-map";
import type {
  InventoryImportRow,
  InventoryImportSummary,
} from "./import-types";

type RawRow = Record<string, unknown>;

const HEADER_ALIASES: Record<string, string[]> = {
  barcode: [
    "barcode",
    "upc",
    "product code",
    "productcode",
    "code",
    "item code",
  ],
  brand: ["brand", "vendor", "manufacturer"],
  category: ["category", "department", "type"],
  cloverCategory: ["clover category", "clovercategory"],
  cloverItemId: ["clover item id", "cloveritemid", "clover id", "item id"],
  cost: ["cost", "cost price", "costprice"],
  description: ["description", "desc"],
  name: [
    "name",
    "product name",
    "productname",
    "item",
    "alternate name",
    "alternatename",
  ],
  price: ["price", "retail price", "retailprice", "sell price", "sellprice"],
  quantity: ["quantity", "qty", "stock", "inventory", "on hand", "onhand"],
  sku: ["sku", "item sku"],
  variantAttribute: ["variant attribute", "variantattribute", "option name"],
  variantOption: ["variant option", "variantoption", "option value"],
};

function normalizeHeader(value: string) {
  return value.trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ").toLowerCase();
}

function buildHeaderLookup(row: RawRow) {
  const lookup = new Map<string, string>();

  for (const key of Object.keys(row)) {
    lookup.set(normalizeHeader(key), key);
  }

  return lookup;
}

function readString(row: RawRow, lookup: Map<string, string>, field: string) {
  for (const alias of HEADER_ALIASES[field] ?? [field]) {
    const key = lookup.get(normalizeHeader(alias));
    if (!key) continue;
    const value = row[key];
    if (value === undefined || value === null) continue;
    return String(value).trim();
  }

  return "";
}

function readNumber(row: RawRow, lookup: Map<string, string>, field: string) {
  const value = readString(row, lookup, field).replace(/[$,]/g, "");
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasUsefulData(row: RawRow) {
  return Object.values(row).some((value) => String(value ?? "").trim());
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function parseCsvRows(bytes: ArrayBuffer) {
  const text = new TextDecoder().decode(bytes);
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  const headers = parseCsvLine(lines[0] ?? "");

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row: RawRow = {};

    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });

    return row;
  });
}

function cellToString(cell: ExcelJS.Cell) {
  const value = cell.value;

  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value) return String(value.result ?? "");
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((item) => item.text).join("");
    }
  }

  return String(value);
}

async function parseXlsxRows(bytes: ArrayBuffer) {
  const workbook = new ExcelJS.Workbook();
  const buffer = Buffer.from(new Uint8Array(bytes));
  await workbook.xlsx.load(buffer as never);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("The uploaded spreadsheet does not contain any sheets.");
  }

  const headers = worksheet.getRow(1).values as ExcelJS.CellValue[];
  const normalizedHeaders = headers
    .slice(1)
    .map((header) => String(header ?? "").trim());
  const rows: RawRow[] = [];

  worksheet.eachRow((sheetRow, rowNumber) => {
    if (rowNumber === 1) return;

    const rawRow: RawRow = {};

    normalizedHeaders.forEach((header, index) => {
      rawRow[header] = cellToString(sheetRow.getCell(index + 1));
    });

    rows.push(rawRow);
  });

  return rows;
}

export async function parseInventoryImportFile(
  fileName: string,
  bytes: ArrayBuffer,
) {
  const rawRows = fileName.toLowerCase().endsWith(".csv")
    ? parseCsvRows(bytes)
    : await parseXlsxRows(bytes);

  const rows = rawRows.filter(hasUsefulData).map((rawRow, index) => {
    const lookup = buildHeaderLookup(rawRow);
    const category = readString(rawRow, lookup, "category");
    const cloverCategory =
      readString(rawRow, lookup, "cloverCategory") ||
      toCloverSafeCategory(category);
    const row: InventoryImportRow = {
      sourceRow: index + 2,
      name: readString(rawRow, lookup, "name"),
      sku: readString(rawRow, lookup, "sku"),
      barcode: readString(rawRow, lookup, "barcode"),
      category,
      cloverCategory,
      brand: readString(rawRow, lookup, "brand"),
      description: readString(rawRow, lookup, "description"),
      price: readNumber(rawRow, lookup, "price"),
      cost: readNumber(rawRow, lookup, "cost"),
      quantity: readNumber(rawRow, lookup, "quantity"),
      variantAttribute: readString(rawRow, lookup, "variantAttribute"),
      variantOption: readString(rawRow, lookup, "variantOption"),
      cloverItemId: readString(rawRow, lookup, "cloverItemId"),
      warnings: [],
    };

    if (!row.name) row.warnings.push("Missing product name");
    if (!row.sku && !row.barcode) row.warnings.push("Missing SKU or barcode");
    if (row.price === null) row.warnings.push("Missing or invalid price");
    if (row.quantity === null) row.warnings.push("Missing or invalid quantity");

    return row;
  });

  return {
    fileName,
    rows,
    summary: summarizeInventoryRows(rows, rawRows.length),
  };
}

export function summarizeInventoryRows(
  rows: InventoryImportRow[],
  totalRows = rows.length,
): InventoryImportSummary {
  const categories: Record<string, number> = {};

  for (const row of rows) {
    const category = row.category || "Uncategorized";
    categories[category] = (categories[category] ?? 0) + 1;
  }

  return {
    totalRows,
    normalizedRows: rows.length,
    warningCount: rows.reduce((total, row) => total + row.warnings.length, 0),
    missingName: rows.filter((row) => !row.name).length,
    missingSkuOrBarcode: rows.filter((row) => !row.sku && !row.barcode).length,
    missingPrice: rows.filter((row) => row.price === null).length,
    missingQuantity: rows.filter((row) => row.quantity === null).length,
    categories,
  };
}
