import {
  areCloverWritesEnabled,
  buildCloverItemPayload,
  buildCloverStockPayload,
  type CloverItemResponse,
  getCloverConfig,
  lookupCloverItems,
} from "./client";
import type {
  CloverSyncPlan,
  CloverSyncPlanItem,
  InventoryImportBatch,
  InventoryImportRow,
} from "./import-types";

const emptyCounts: Record<CloverSyncPlanItem["action"], number> = {
  create: 0,
  match: 0,
  "needs-review": 0,
  skip: 0,
  "stock-update": 0,
  update: 0,
};

function toCloverSummary(item: CloverItemResponse) {
  return {
    code: item.code,
    id: item.id,
    name: item.name,
    price: item.price,
    sku: item.sku,
    stock: item.itemStock?.quantity ?? null,
  };
}

function buildPlanItem(
  row: InventoryImportRow,
  matches: CloverItemResponse[],
): CloverSyncPlanItem {
  if (row.warnings.some((warning) => warning.startsWith("Missing product name"))) {
    return {
      action: "skip",
      reason: "Cannot sync rows without a product name.",
      row,
    };
  }

  if (!row.sku && !row.barcode && !row.cloverItemId) {
    return {
      action: "needs-review",
      reason: "No SKU, barcode, or Clover item ID is available for matching.",
      row,
    };
  }

  const itemPayload = buildCloverItemPayload(row);
  const stockPayload = buildCloverStockPayload(row);

  if (matches.length === 0) {
    return {
      action: "create",
      payload: {
        item: itemPayload,
        stock: stockPayload,
      },
      reason: "No matching Clover item found.",
      row,
    };
  }

  if (matches.length > 1) {
    return {
      action: "needs-review",
      cloverItem: toCloverSummary(matches[0]),
      payload: {
        item: itemPayload,
        stock: stockPayload,
      },
      reason: "Multiple Clover matches found. Manual review required.",
      row,
    };
  }

  const match = matches[0];
  const cloverPrice = typeof match.price === "number" ? match.price : null;
  const importedPriceCents = row.price === null ? null : Math.round(row.price * 100);
  const cloverStock = match.itemStock?.quantity ?? null;
  const priceChanged =
    importedPriceCents !== null &&
    cloverPrice !== null &&
    importedPriceCents !== cloverPrice;
  const nameChanged = row.name.trim() !== match.name.trim();
  const stockChanged =
    row.quantity !== null && cloverStock !== null && row.quantity !== cloverStock;

  if (nameChanged || priceChanged) {
    return {
      action: "update",
      cloverItem: toCloverSummary(match),
      payload: {
        item: itemPayload,
        stock: stockPayload,
      },
      reason: [
        nameChanged ? "name differs" : null,
        priceChanged ? "price differs" : null,
        stockChanged ? "stock differs" : null,
      ]
        .filter(Boolean)
        .join(", "),
      row,
    };
  }

  if (stockChanged) {
    return {
      action: "stock-update",
      cloverItem: toCloverSummary(match),
      payload: {
        stock: stockPayload,
      },
      reason: "Stock quantity differs.",
      row,
    };
  }

  return {
    action: "match",
    cloverItem: toCloverSummary(match),
    reason: "Spreadsheet row matches Clover by SKU/barcode/item ID.",
    row,
  };
}

export async function createCloverSyncPlan(
  batch: InventoryImportBatch,
  options: { limit?: number } = {},
): Promise<CloverSyncPlan> {
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 500);
  const rows = batch.rows.slice(0, limit);
  const clover = getCloverConfig();
  const items: CloverSyncPlanItem[] = [];

  for (const row of rows) {
    if (!clover.configured) {
      items.push({
        action: "needs-review",
        reason: "Clover is not configured. Import is stored in Medusa for later sync.",
        row,
      });
      continue;
    }

    const lookup = await lookupCloverItems(row);
    items.push(buildPlanItem(row, lookup.items));
  }

  const counts = { ...emptyCounts };
  for (const item of items) counts[item.action] += 1;

  return {
    batchId: batch.id,
    cloverConfigured: clover.configured,
    counts,
    generatedAt: new Date().toISOString(),
    items,
    limit,
    message: areCloverWritesEnabled()
      ? "Clover writes are env-enabled, but this Medusa endpoint is still dry-run only."
      : "Clover writes are locked. This Medusa sync plan does not mutate Clover inventory.",
    mode: "dry-run",
    writesEnabled: areCloverWritesEnabled(),
  };
}
