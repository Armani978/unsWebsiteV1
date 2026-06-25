export type CloverEnvironment = "sandbox" | "production";

export type CloverConfig = {
  accessToken: string;
  apiBaseUrl: string;
  environment: CloverEnvironment;
  merchantId: string;
};

export type CloverItemResponse = {
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

export function getCloverEnvironment(): CloverEnvironment {
  return process.env.CLOVER_ENV === "production" ? "production" : "sandbox";
}

export function areCloverWritesEnabled() {
  return process.env.CLOVER_ALLOW_WRITES === "true";
}

export function getCloverApiBaseUrl(environment: CloverEnvironment) {
  return environment === "production"
    ? "https://api.clover.com"
    : "https://apisandbox.dev.clover.com";
}

export function getCloverConfig() {
  const environment = getCloverEnvironment();
  const merchantId = process.env.CLOVER_MERCHANT_ID?.trim();
  const accessToken = process.env.CLOVER_ACCESS_TOKEN?.trim();
  const apiBaseUrl =
    process.env.CLOVER_API_BASE_URL?.replace(/\/$/, "") ??
    getCloverApiBaseUrl(environment);
  const missing = [
    !merchantId ? "CLOVER_MERCHANT_ID" : null,
    !accessToken ? "CLOVER_ACCESS_TOKEN" : null,
  ].filter(Boolean);

  if (!merchantId || !accessToken) {
    return {
      apiBaseUrl,
      configured: false as const,
      environment,
      missing,
    };
  }

  return {
    configured: true as const,
    config: {
      accessToken,
      apiBaseUrl,
      environment,
      merchantId,
    } satisfies CloverConfig,
  };
}

export function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

export function buildCloverItemPayload(input: {
  barcode: string;
  name: string;
  price: number | null;
  sku: string;
}) {
  const code = input.sku.trim() || input.barcode.trim() || undefined;

  return {
    code,
    defaultTaxRates: true,
    isRevenue: true,
    name: input.name.trim(),
    price: dollarsToCents(input.price ?? 0),
    priceType: "FIXED",
    sku: code,
  };
}

export function buildCloverStockPayload(input: { quantity: number | null }) {
  return {
    quantity: input.quantity ?? 0,
  };
}

export async function cloverFetch<T>(
  config: CloverConfig,
  path: string,
  options: { body?: unknown; method?: "GET" | "POST" | "PUT" } = {},
) {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "upnsmoke-medusa-ops/0.1.0",
    },
    method: options.method ?? "GET",
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    return {
      data,
      ok: false as const,
      status: response.status,
    };
  }

  return {
    data: data as T,
    ok: true as const,
    status: response.status,
  };
}

export async function lookupCloverItems(input: {
  barcode: string;
  cloverItemId: string;
  sku: string;
}) {
  const clover = getCloverConfig();

  if (!clover.configured) {
    return {
      clover,
      items: [],
    };
  }

  if (input.cloverItemId) {
    const response = await cloverFetch<CloverItemResponse>(
      clover.config,
      `/v3/merchants/${clover.config.merchantId}/items/${input.cloverItemId}?expand=itemStock`,
    );

    return {
      clover,
      items: response.ok ? [response.data] : [],
    };
  }

  const codes = [input.barcode, input.sku].filter(Boolean);
  const queries = codes.flatMap((code) => [
    { code, field: "itemCode" },
    { code, field: "sku" },
  ]);
  const responses = await Promise.all(
    queries.map(({ code, field }) => {
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

  return {
    clover,
    items: Array.from(
      new Map(
        responses
          .filter((response) => response.ok)
          .flatMap((response) => response.data.elements ?? [])
          .map((item) => [item.id, item]),
      ).values(),
    ),
  };
}
