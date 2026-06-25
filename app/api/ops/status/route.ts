import { requireApiPermission } from "../../../lib/auth/api-guards";
import {
  getAllowedEmployeeDomains,
  getAllowedEmployeeEmails,
} from "../../../lib/auth/employee-oauth";
import { listInventoryImportBatches } from "../../../lib/inventory/import-store";
import { getMedusaBackendUrl } from "../../../lib/medusa/ops";

async function checkMedusa() {
  const backendUrl = getMedusaBackendUrl();

  if (!backendUrl) {
    return {
      configured: false,
      ok: false,
      status: null,
      url: null,
    };
  }

  try {
    const response = await fetch(`${backendUrl}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });

    return {
      configured: true,
      ok: response.ok,
      status: response.status,
      url: backendUrl,
    };
  } catch (error) {
    return {
      configured: true,
      error: error instanceof Error ? error.message : "Unable to reach Medusa.",
      ok: false,
      status: null,
      url: backendUrl,
    };
  }
}

export async function GET() {
  const auth = await requireApiPermission("settings.write");
  if (!auth.ok) return auth.response;

  const [medusa, batches] = await Promise.all([
    checkMedusa(),
    listInventoryImportBatches(),
  ]);
  const cloverMissing = [
    !process.env.CLOVER_MERCHANT_ID ? "CLOVER_MERCHANT_ID" : null,
    !process.env.CLOVER_ACCESS_TOKEN ? "CLOVER_ACCESS_TOKEN" : null,
  ].filter(Boolean);
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const appleConfigured = Boolean(
    process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET,
  );
  const allowlistConfigured =
    getAllowedEmployeeEmails().size > 0 || getAllowedEmployeeDomains().size > 0;

  return Response.json({
    auth: {
      allowlistConfigured,
      appleConfigured,
      devLoginEnabled:
        process.env.NODE_ENV !== "production" ||
        process.env.EMPLOYEE_DEV_LOGIN_ENABLED === "true",
      googleConfigured,
      passkeyEnabled: false,
    },
    clover: {
      configured: cloverMissing.length === 0,
      env: process.env.CLOVER_ENV || "sandbox",
      missing: cloverMissing,
      syncEnabled: process.env.CLOVER_SYNC_ENABLED === "true",
      writesEnabled: process.env.CLOVER_ALLOW_WRITES === "true",
    },
    imports: {
      latestImportedAt: batches[0]?.importedAt ?? null,
      latestName: batches[0]?.fileName ?? null,
      totalBatches: batches.length,
    },
    medusa,
  });
}
