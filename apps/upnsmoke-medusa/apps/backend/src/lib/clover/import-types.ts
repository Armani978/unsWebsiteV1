export type InventoryImportRow = {
  barcode: string;
  brand: string;
  category: string;
  cloverCategory: string;
  cloverItemId: string;
  cost: number | null;
  description: string;
  name: string;
  price: number | null;
  quantity: number | null;
  sku: string;
  sourceRow: number;
  variantAttribute: string;
  variantOption: string;
  warnings: string[];
};

export type InventoryImportSummary = {
  categories: Record<string, number>;
  missingName: number;
  missingPrice: number;
  missingQuantity: number;
  missingSkuOrBarcode: number;
  normalizedRows: number;
  totalRows: number;
  warningCount: number;
};

export type InventoryImportBatch = {
  dryRun: boolean;
  fileName: string;
  id: string;
  importedAt: string;
  rows: InventoryImportRow[];
  source: "api" | "upload";
  status: "imported" | "planned" | "synced" | "failed";
  summary: InventoryImportSummary;
};

export type CloverSyncPlanItem = {
  action: "create" | "match" | "needs-review" | "skip" | "stock-update" | "update";
  cloverItem?: {
    code?: string;
    id: string;
    name: string;
    price?: number;
    sku?: string;
    stock?: number | null;
  };
  payload?: {
    item?: Record<string, unknown>;
    stock?: Record<string, unknown>;
  };
  reason: string;
  row: InventoryImportRow;
};

export type CloverSyncPlan = {
  batchId: string;
  cloverConfigured: boolean;
  counts: Record<CloverSyncPlanItem["action"], number>;
  generatedAt: string;
  items: CloverSyncPlanItem[];
  limit: number;
  message: string;
  mode: "dry-run";
  writesEnabled: boolean;
};
