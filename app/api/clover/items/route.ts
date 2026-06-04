import { NextResponse } from "next/server";
import {
  areCloverWritesEnabled,
  buildCloverItemPayload,
  buildCloverItemStockPayload,
  buildCloverVariantPlan,
  cloverFetch,
  type ScannerItemPayload,
} from "../../../lib/clover";
import { getActiveCloverConfig } from "../../../lib/clover-connection";
import {
  getImportedCatalogCount,
  lookupImportedCatalog,
} from "../../../lib/import-catalog";

type CloverItemResponse = {
  code?: string;
  id: string;
  name: string;
  price: number;
  sku?: string;
  itemStock?: {
    quantity?: number;
  };
};

type CloverItemsResponse = {
  elements?: CloverItemResponse[];
};

function validateScannerItem(item: Partial<ScannerItemPayload>) {
  if (!item.name?.trim()) return "Product Name is required.";
  if (!Number.isFinite(item.price) || Number(item.price) < 0) {
    return "Price must be a valid positive number.";
  }

  return null;
}

export async function POST(request: Request) {
  const item = (await request.json()) as ScannerItemPayload;
  const validationError = validateScannerItem(item);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const clover = await getActiveCloverConfig();
  const hasVariants = Boolean(
    item.variants?.some((variant) => variant.value.trim()),
  );
  const cloverPayload = buildCloverItemPayload(item);
  const stockPayload = buildCloverItemStockPayload(item);
  const variantPlan = hasVariants ? buildCloverVariantPlan(item) : null;

  if (!clover.configured) {
    return NextResponse.json({
      mode: "dry-run",
      message:
        "Clover credentials are not configured. Item payload was validated but not sent.",
      missing: clover.missing,
      item,
      cloverPayload,
      stockPayload,
      variantPlan,
    });
  }

  if (!areCloverWritesEnabled()) {
    return NextResponse.json({
      mode: "dry-run",
      message:
        "Clover writes are locked. Item payload was validated but not sent. Enable CLOVER_ALLOW_WRITES only after verifying the connected merchant.",
      item,
      cloverPayload,
      stockPayload,
      variantPlan,
    });
  }

  if (hasVariants) {
    return NextResponse.json({
      mode: "dry-run",
      message:
        "Variant payload prepared. Clover item-group write is intentionally gated until we confirm the exact variant sync workflow.",
      item,
      cloverPayload,
      variantPlan,
    });
  }

  const response = await cloverFetch<CloverItemResponse>(
    clover.config,
    `/v3/merchants/${clover.config.merchantId}/items`,
    {
      method: "POST",
      body: cloverPayload,
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      {
        mode: "clover",
        ok: false,
        status: response.status,
        error: response.data,
        cloverPayload,
      },
      { status: response.status },
    );
  }

  const stockResponse = await cloverFetch<{
    item: { id: string };
    quantity: number;
  }>(
    clover.config,
    `/v3/merchants/${clover.config.merchantId}/item_stocks/${response.data.id}`,
    {
      method: "POST",
      body: stockPayload,
    },
  );

  if (!stockResponse.ok) {
    return NextResponse.json(
      {
        mode: "clover",
        ok: false,
        partial: true,
        message:
          "The Clover item was created, but its stock quantity could not be set.",
        item: response.data,
        status: stockResponse.status,
        error: stockResponse.data,
        cloverPayload,
        stockPayload,
      },
      { status: stockResponse.status },
    );
  }

  return NextResponse.json({
    mode: "clover",
    ok: true,
    item: response.data,
    itemStock: stockResponse.data,
    cloverPayload,
    stockPayload,
  });
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json(
      { error: "UPC or SKU is required." },
      { status: 400 },
    );
  }

  const clover = await getActiveCloverConfig();
  const importedCatalogItems = lookupImportedCatalog(code).map((item) => ({
    ...item,
    id: `spreadsheet-${item.row}`,
  }));

  if (!clover.configured) {
    return NextResponse.json({
      configured: false,
      found: importedCatalogItems.length > 0,
      items: importedCatalogItems,
      localCatalogCount: getImportedCatalogCount(),
      message:
        "Clover inventory is not connected yet. Showing spreadsheet catalog results.",
      source: "spreadsheet",
    });
  }

  const query = (field: "itemCode" | "sku") => {
    const search = new URLSearchParams({
      expand: "itemStock",
      filter: `${field}=${code}`,
      limit: "10",
    });

    return cloverFetch<CloverItemsResponse>(
      clover.config,
      `/v3/merchants/${clover.config.merchantId}/items?${search.toString()}`,
    );
  };
  const [itemCodeResponse, skuResponse] = await Promise.all([
    query("itemCode"),
    query("sku"),
  ]);

  if (!itemCodeResponse.ok || !skuResponse.ok) {
    const failedResponse = !itemCodeResponse.ok
      ? itemCodeResponse
      : skuResponse;

    return NextResponse.json({
      configured: true,
      error: "Clover inventory lookup failed.",
      found: importedCatalogItems.length > 0,
      items: importedCatalogItems,
      localCatalogCount: getImportedCatalogCount(),
      source: importedCatalogItems.length > 0 ? "spreadsheet" : "clover",
      status: failedResponse.status,
    });
  }

  const items = [
    ...(itemCodeResponse.data.elements ?? []),
    ...(skuResponse.data.elements ?? []),
  ];
  const uniqueItems = Array.from(
    new Map(items.map((item) => [item.id, item])).values(),
  );

  return NextResponse.json({
    configured: true,
    found: uniqueItems.length > 0 || importedCatalogItems.length > 0,
    items: uniqueItems.length > 0 ? uniqueItems : importedCatalogItems,
    localCatalogCount: getImportedCatalogCount(),
    source: uniqueItems.length > 0 ? clover.source : "spreadsheet",
  });
}
