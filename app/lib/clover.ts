export type CloverEnvironment = "sandbox" | "production";

export type CloverConfig = {
  accessToken: string;
  apiBaseUrl: string;
  environment: CloverEnvironment;
  merchantId: string;
};

type CloverOAuthConfig = {
  appId: string;
  appSecret: string;
  appUrl: string;
  authorizeBaseUrl: string;
  environment: CloverEnvironment;
  tokenBaseUrl: string;
};

export type ScannerVariantPayload = {
  category: string;
  value: string;
  sku?: string;
  price?: number | null;
  quantity?: number | null;
};

export type ScannerItemPayload = {
  sku: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
  variants?: ScannerVariantPayload[];
  photo?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  } | null;
};

type CloverRequestOptions = {
  body?: unknown;
  method?: "GET" | "POST";
};

export type CloverOAuthTokenResponse = {
  access_token: string;
  access_token_expiration: number;
  refresh_token: string;
  refresh_token_expiration: number;
};

const CLOVER_BASE_URLS: Record<CloverEnvironment, string> = {
  sandbox: "https://apisandbox.dev.clover.com",
  production: "https://api.clover.com",
};

export function getCloverApiBaseUrl(environment: CloverEnvironment) {
  return CLOVER_BASE_URLS[environment];
}

const CLOVER_AUTHORIZE_BASE_URLS: Record<CloverEnvironment, string> = {
  sandbox: "https://sandbox.dev.clover.com",
  production: "https://www.clover.com",
};

export function getCloverEnvironment(): CloverEnvironment {
  return process.env.CLOVER_ENV === "production" ? "production" : "sandbox";
}

export function areCloverWritesEnabled() {
  return process.env.CLOVER_ALLOW_WRITES === "true";
}

export function getCloverConfig() {
  const environment = getCloverEnvironment();
  const merchantId = process.env.CLOVER_MERCHANT_ID?.trim();
  const accessToken = process.env.CLOVER_ACCESS_TOKEN?.trim();
  const apiBaseUrl =
    process.env.CLOVER_API_BASE_URL?.replace(/\/$/, "") ??
    CLOVER_BASE_URLS[environment];

  const missing = [
    !merchantId ? "CLOVER_MERCHANT_ID" : null,
    !accessToken ? "CLOVER_ACCESS_TOKEN" : null,
  ].filter(Boolean);

  if (!merchantId || !accessToken) {
    return {
      configured: false as const,
      environment,
      missing,
      apiBaseUrl,
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

export function getCloverOAuthConfig() {
  const environment = getCloverEnvironment();
  const appId = process.env.CLOVER_APP_ID?.trim();
  const appSecret = process.env.CLOVER_APP_SECRET?.trim();
  const appUrl = process.env.CLOVER_APP_URL?.replace(/\/$/, "");
  const missing = [
    !appId ? "CLOVER_APP_ID" : null,
    !appSecret ? "CLOVER_APP_SECRET" : null,
    !appUrl ? "CLOVER_APP_URL" : null,
  ].filter(Boolean);

  if (!appId || !appSecret || !appUrl) {
    return {
      configured: false as const,
      environment,
      missing,
    };
  }

  return {
    configured: true as const,
    config: {
      appId,
      appSecret,
      appUrl,
      authorizeBaseUrl: CLOVER_AUTHORIZE_BASE_URLS[environment],
      environment,
      tokenBaseUrl: CLOVER_BASE_URLS[environment],
    } satisfies CloverOAuthConfig,
  };
}

export function buildCloverAuthorizeUrl(config: CloverOAuthConfig) {
  const callbackUrl = `${config.appUrl}/api/clover/callback`;
  const authorizeUrl = new URL("/oauth/v2/authorize", config.authorizeBaseUrl);
  authorizeUrl.searchParams.set("client_id", config.appId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  return authorizeUrl;
}

export async function exchangeCloverAuthorizationCode(
  config: CloverOAuthConfig,
  code: string,
) {
  const response = await fetch(`${config.tokenBaseUrl}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.appId,
      client_secret: config.appSecret,
      code,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Clover token exchange failed with ${response.status}.`);
  }

  return (await response.json()) as CloverOAuthTokenResponse;
}

export function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

export function buildCloverItemPayload(item: ScannerItemPayload) {
  const code = item.sku.trim() || undefined;

  return {
    name: item.name.trim(),
    price: dollarsToCents(item.price),
    priceType: "FIXED",
    defaultTaxRates: true,
    isRevenue: true,
    code,
    sku: code,
  };
}

export function buildCloverItemStockPayload(item: ScannerItemPayload) {
  return {
    quantity: item.quantity,
  };
}

export function buildCloverVariantPlan(item: ScannerItemPayload) {
  const variants =
    item.variants?.filter((variant) => variant.value.trim()) ?? [];
  const attributes = Array.from(
    new Set(variants.map((variant) => variant.category.trim()).filter(Boolean)),
  );

  return {
    itemGroup: {
      name: item.name.trim(),
    },
    attributes: attributes.map((name) => ({ name })),
    options: variants.map((variant) => ({
      attributeName: variant.category.trim(),
      name: variant.value.trim(),
    })),
    items: variants.map((variant) => ({
      ...buildCloverItemPayload({
        ...item,
        name: `${item.name.trim()} - ${variant.value.trim()}`,
        price: variant.price ?? item.price,
        sku: variant.sku || item.sku,
      }),
      optionName: variant.value.trim(),
      quantity: variant.quantity ?? item.quantity,
    })),
  };
}

export async function cloverFetch<T>(
  config: CloverConfig,
  path: string,
  options: CloverRequestOptions = {},
) {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "upnsmoke-inventory/0.1.0",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      data,
    };
  }

  return {
    ok: true as const,
    status: response.status,
    data: data as T,
  };
}
