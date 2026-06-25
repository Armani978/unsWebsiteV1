export type InventoryImportRow = {
  sourceRow: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  cloverCategory: string;
  brand: string;
  description: string;
  price: number | null;
  cost: number | null;
  quantity: number | null;
  variantAttribute: string;
  variantOption: string;
  cloverItemId: string;
  warnings: string[];
};

export type InventoryImportSummary = {
  totalRows: number;
  normalizedRows: number;
  warningCount: number;
  missingName: number;
  missingSkuOrBarcode: number;
  missingPrice: number;
  missingQuantity: number;
  categories: Record<string, number>;
};

export type InventoryImportBatch = {
  id: string;
  fileName: string;
  importedAt: string;
  source: "upload" | "seed" | "api";
  status: "imported" | "planned" | "synced" | "failed";
  dryRun: boolean;
  summary: InventoryImportSummary;
  rows: InventoryImportRow[];
};

export type CloverSyncPlanItem = {
  row: InventoryImportRow;
  action:
    | "create"
    | "update"
    | "stock-update"
    | "match"
    | "needs-review"
    | "skip";
  reason: string;
  cloverItem?: {
    id: string;
    name: string;
    sku?: string;
    code?: string;
    price?: number;
    stock?: number | null;
  };
  payload?: {
    item?: Record<string, unknown>;
    stock?: Record<string, unknown>;
  };
};

export type CloverSyncPlan = {
  batchId: string;
  generatedAt: string;
  mode: "dry-run";
  cloverConfigured: boolean;
  writesEnabled: boolean;
  source: "clover" | "environment" | "oauth" | "local-only";
  limit: number;
  counts: Record<CloverSyncPlanItem["action"], number>;
  items: CloverSyncPlanItem[];
  message: string;
};
