import { NextResponse } from "next/server";
import {
  areCloverWritesEnabled,
  cloverFetch,
  getCloverConfig,
  getCloverOAuthConfig,
} from "../../../lib/clover";
import { getStoredCloverConnectionMetadata } from "../../../lib/clover-token-store";

export async function GET() {
  const clover = getCloverConfig();
  const oauth = getCloverOAuthConfig();
  const writesEnabled = areCloverWritesEnabled();
  let storedConnection = null;

  try {
    storedConnection = await getStoredCloverConnectionMetadata();
  } catch {
    storedConnection = null;
  }

  if (!clover.configured) {
    return NextResponse.json({
      configured: false,
      environment: clover.environment,
      apiBaseUrl: clover.apiBaseUrl,
      missing: clover.missing,
      oauthConfigured: oauth.configured,
      oauthMissing: oauth.configured ? [] : oauth.missing,
      writesEnabled,
      storedConnection,
    });
  }

  const [merchantResponse, inventoryResponse] = await Promise.all([
    cloverFetch<{ id: string; name?: string }>(
      clover.config,
      `/v3/merchants/${clover.config.merchantId}`,
    ),
    cloverFetch<{ elements?: unknown[] }>(
      clover.config,
      `/v3/merchants/${clover.config.merchantId}/items?limit=1`,
    ),
  ]);

  return NextResponse.json({
    configured: true,
    environment: clover.config.environment,
    ok: inventoryResponse.ok,
    merchant: merchantResponse.ok ? merchantResponse.data : null,
    oauthConfigured: oauth.configured,
    oauthMissing: oauth.configured ? [] : oauth.missing,
    writesEnabled,
    storedConnection,
    capabilities: {
      inventoryRead: {
        ok: inventoryResponse.ok,
        status: inventoryResponse.status,
      },
      merchantRead: {
        ok: merchantResponse.ok,
        status: merchantResponse.status,
      },
    },
  });
}
