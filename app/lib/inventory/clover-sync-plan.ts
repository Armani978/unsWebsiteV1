import {
  areCloverWritesEnabled,
  buildCloverItemPayload,
  buildCloverItemStockPayload,
  cloverFetch,
  type ScannerItemPayload,
} from "../clover";
import { getActiveCloverConfig } from "../clover-connection";
import type {
  CloverSyncPlan,
  CloverSyncPlanItem,
  InventoryImportBatch,
  InventoryImportRow,
} from "./import-types";

type CloverItemResponse = {
  code?: string;
  id: string;
  name: string;
  price?: number;
  sku?: string;
  itemStock?: {
    quantity?: number;
  };
};

type CloverItemsResponse = {
  elements?: CloverItemResponse[];
};

const emptyCounts: Record<CloverSyncPlanItem["action"], number> = {
  create: 0,
  update: 0,
  "stock-update": 0,
  match: 0,
  "needs-review": 0,
  skip: 0,
};

function toScannerPayload(row: InventoryImportRow): ScannerItemPayload {
  return {
    sku: row.sku || row.barcode,
    name: row.name,
    price: row.price ?? 0,
    category: row.cloverCategory,
    quantity: row.quantity ?? 0,
    variants: row.variantOption
      ? [
          {
            category: row.variantAttribute || "Option",
            value: row.variantOption,
            sku: row.sku,
            price: row.price,
            quantity: row.quantity,
          },
        ]
      : [],
  };
}

function toCloverSummary(item: CloverItemResponse) {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    code: item.code,
    price: item.price,
    stock: item.itemStock?.quantity ?? null,
  };
}

async function lookupCloverItem(
  clover: Awaited<ReturnType<typeof getActiveCloverConfig>>,
  row: InventoryImportRow,
) {
  if (!clover.configured) return [];

  if (row.cloverItemId) {
    const response = await cloverFetch<CloverItemResponse>(
      clover.config,
      `/v3/merchants/${clover.config.merchantId}/items/${row.cloverItemId}?expand=itemStock`,
    );

    return response.ok ? [response.data] : [];
  }

  const codes = [row.barcode, row.sku].filter(Boolean);
  const queries = codes.flatMap((code) => [
    { field: "itemCode", code },
    { field: "sku", code },
  ]);
  const responses = await Promise.all(
    queries.map(({ field, code }) => {
      const search = new URLSearchParams({
        expand: "itemStock",
        filter: `${field}=${code}`,
        limit: "10",
      });

      return cloverFetch<CloverItemsResponse>(
        clover.config,
        `/v3/merchants/${clover.config.merchantId}/items?${search.toString()}`,
      );
    }),
  );

  return Array.from(
    new Map(
      responses
        .filter((response) => response.ok)
        .flatMap((response) => response.data.elements ?? [])
        .map((item) => [item.id, item]),
    ).values(),
  );
}

function buildPlanItem(
  row: InventoryImportRow,
  matches: CloverItemResponse[],
): CloverSyncPlanItem {
  if (
    row.warnings.some((warning) => warning.startsWith("Missing product name"))
  ) {
    return {
      row,
      action: "skip",
      reason: "Cannot sync rows without a product name.",
    };
  }

  if (!row.sku && !row.barcode && !row.cloverItemId) {
    return {
      row,
      action: "needs-review",
      reason: "No SKU, barcode, or Clover item ID is available for matching.",
    };
  }

  const payload = toScannerPayload(row);
  const itemPayload = buildCloverItemPayload(payload);
  const stockPayload = buildCloverItemStockPayload(payload);

  if (matches.length === 0) {
    return {
      row,
      action: "create",
      reason: "No matching Clover item found.",
      payload: {
        item: itemPayload,
        stock: stockPayload,
      },
    };
  }

  if (matches.length > 1) {
    return {
      row,
      action: "needs-review",
      reason: "Multiple Clover matches found. Manual review required.",
      cloverItem: toCloverSummary(matches[0]),
      payload: {
        item: itemPayload,
        stock: stockPayload,
      },
    };
  }

  const match = matches[0];
  const cloverPrice = typeof match.price === "number" ? match.price : null;
  const importedPriceCents =
    row.price === null ? null : Math.round(row.price * 100);
  const cloverStock = match.itemStock?.quantity ?? null;
  const importedStock = row.quantity;
  const priceChanged =
    importedPriceCents !== null &&
    cloverPrice !== null &&
    importedPriceCents !== cloverPrice;
  const nameChanged = row.name.trim() !== match.name.trim();
  const stockChanged =
    importedStock !== null &&
    cloverStock !== null &&
    importedStock !== cloverStock;

  if (nameChanged || priceChanged) {
    return {
      row,
      action: "update",
      reason: [
        nameChanged ? "name differs" : null,
        priceChanged ? "price differs" : null,
        stockChanged ? "stock differs" : null,
      ]
        .filter(Boolean)
        .join(", "),
      cloverItem: toCloverSummary(match),
      payload: {
        item: itemPayload,
        stock: stockPayload,
      },
    };
  }

  if (stockChanged) {
    return {
      row,
      action: "stock-update",
      reason: "Stock quantity differs.",
      cloverItem: toCloverSummary(match),
      payload: {
        stock: stockPayload,
      },
    };
  }

  return {
    row,
    action: "match",
    reason: "Spreadsheet row matches Clover by SKU/barcode/item ID.",
    cloverItem: toCloverSummary(match),
  };
}

export async function createCloverSyncPlan(
  batch: InventoryImportBatch,
  options: { limit?: number } = {},
): Promise<CloverSyncPlan> {
  const clover = await getActiveCloverConfig();
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 500);
  const rows = batch.rows.slice(0, limit);
  const items: CloverSyncPlanItem[] = [];

  if (!clover.configured) {
    for (const row of rows) {
      items.push({
        row,
        action: "needs-review",
        reason:
          "Clover is not configured. Import is stored locally for later sync.",
      });
    }
  } else {
    for (const row of rows) {
      const matches = await lookupCloverItem(clover, row);
      items.push(buildPlanItem(row, matches));
    }
  }

  const counts = { ...emptyCounts };
  for (const item of items) counts[item.action] += 1;

  return {
    batchId: batch.id,
    generatedAt: new Date().toISOString(),
    mode: "dry-run",
    cloverConfigured: clover.configured,
    writesEnabled: areCloverWritesEnabled(),
    source: clover.configured ? clover.source : "local-only",
    limit,
    counts,
    items,
    message: areCloverWritesEnabled()
      ? "Clover writes are enabled, but this endpoint still returns a dry-run plan only."
      : "Clover writes are locked. This plan does not mutate Clover inventory.",
  };
}
