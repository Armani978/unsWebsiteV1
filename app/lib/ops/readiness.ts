import {
  getAllowedEmployeeDomains,
  getAllowedEmployeeEmails,
  isEmployeeDevLoginEnabled,
} from "../auth/employee-oauth";
import { listInventoryImportBatches } from "../inventory/import-store";
import { getMedusaBackendUrl } from "../medusa/ops";

export type OpsActionPriority = "high" | "medium" | "low";

export type OpsAction = {
  id: string;
  title: string;
  detail: string;
  priority: OpsActionPriority;
  area: "auth" | "clover" | "imports" | "medusa" | "safety";
};

export type OpsSnapshot = {
  generatedAt: string;
  readinessScore: number;
  state: "blocked" | "setup" | "ready" | "live-risk";
  summary: string;
  actions: OpsAction[];
  checks: {
    auth: {
      allowlistConfigured: boolean;
      appleConfigured: boolean;
      devLoginEnabled: boolean;
      googleConfigured: boolean;
      passkeyEnabled: boolean;
    };
    clover: {
      configured: boolean;
      env: string;
      missing: string[];
      syncEnabled: boolean;
      writesEnabled: boolean;
    };
    imports: {
      latestImportedAt: string | null;
      latestName: string | null;
      totalBatches: number;
      warningCount: number;
    };
    medusa: {
      configured: boolean;
      error?: string;
      ok: boolean;
      status: number | null;
      url: string | null;
    };
  };
};

export async function checkMedusa() {
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
      error:
        error instanceof Error && error.message !== "fetch failed"
          ? error.message
          : "Medusa is not reachable at the configured backend URL.",
      ok: false,
      status: null,
      url: backendUrl,
    };
  }
}

function priorityWeight(priority: OpsActionPriority) {
  if (priority === "high") return 18;
  if (priority === "medium") return 10;
  return 5;
}

function getState(score: number, actions: OpsAction[], writesEnabled: boolean) {
  if (writesEnabled && actions.some((action) => action.priority === "high")) {
    return "live-risk" as const;
  }
  if (actions.some((action) => action.priority === "high")) {
    return "blocked" as const;
  }
  if (score >= 86) return "ready" as const;
  return "setup" as const;
}

function summarize(state: OpsSnapshot["state"], score: number) {
  if (state === "live-risk") {
    return "Live writes are enabled while setup blockers remain. Lock writes before continuing.";
  }
  if (state === "blocked") {
    return "Core setup is still blocked. Handle the high-priority actions before live operations.";
  }
  if (state === "ready") {
    return "Core systems look ready for controlled staff testing.";
  }
  return `Setup is ${score}% ready. Finish the remaining action queue before live Clover writes.`;
}

export async function getOpsSnapshot(): Promise<OpsSnapshot> {
  const [medusa, batches] = await Promise.all([
    checkMedusa(),
    listInventoryImportBatches(),
  ]);
  const cloverMissing = [
    !process.env.CLOVER_MERCHANT_ID ? "CLOVER_MERCHANT_ID" : null,
    !process.env.CLOVER_ACCESS_TOKEN ? "CLOVER_ACCESS_TOKEN" : null,
  ].filter(Boolean) as string[];
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const appleConfigured = Boolean(
    process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET,
  );
  const allowlistConfigured =
    getAllowedEmployeeEmails().size > 0 || getAllowedEmployeeDomains().size > 0;
  const writesEnabled = process.env.CLOVER_ALLOW_WRITES === "true";
  const latestBatch = batches[0];
  const actions: OpsAction[] = [];

  if (!allowlistConfigured) {
    actions.push({
      id: "auth-allowlist",
      title: "Configure employee allowlist",
      detail:
        "Set employee emails or trusted domains before Apple or Google can create staff sessions.",
      priority: "high",
      area: "auth",
    });
  }

  if (!googleConfigured && !appleConfigured) {
    actions.push({
      id: "auth-provider",
      title: "Add at least one provider login",
      detail:
        "Google or Apple credentials are needed before the staff portal can use real provider sign-in.",
      priority: "high",
      area: "auth",
    });
  }

  if (cloverMissing.length > 0) {
    actions.push({
      id: "clover-credentials",
      title: "Connect Clover merchant credentials",
      detail: `Missing ${cloverMissing.join(", ")} for the website-to-Clover merchant connection.`,
      priority: "high",
      area: "clover",
    });
  }

  if (!medusa.configured) {
    actions.push({
      id: "medusa-url",
      title: "Point the website at Medusa",
      detail:
        "Set MEDUSA_BACKEND_URL when the Medusa backend should own import operations.",
      priority: "medium",
      area: "medusa",
    });
  } else if (!medusa.ok) {
    actions.push({
      id: "medusa-health",
      title: "Bring Medusa health check online",
      detail:
        medusa.error ??
        `Medusa health returned ${medusa.status ?? "no status"}.`,
      priority: "medium",
      area: "medusa",
    });
  }

  if (batches.length === 0) {
    actions.push({
      id: "import-first-file",
      title: "Upload a sample inventory file",
      detail:
        "Upload the sample CSV or a real export so the sync planner has store data to review.",
      priority: "medium",
      area: "imports",
    });
  } else if ((latestBatch?.summary.warningCount ?? 0) > 0) {
    actions.push({
      id: "import-warnings",
      title: "Review latest import warnings",
      detail: `${latestBatch?.fileName ?? "Latest import"} has ${latestBatch?.summary.warningCount ?? 0} rows that need cleanup before syncing.`,
      priority: "low",
      area: "imports",
    });
  }

  if (writesEnabled) {
    actions.push({
      id: "clover-write-lock",
      title: "Double-check live Clover writes",
      detail:
        "CLOVER_ALLOW_WRITES is enabled. Keep it off until staff validates imports, matches, and stock edits.",
      priority: actions.some((action) => action.priority === "high")
        ? "high"
        : "medium",
      area: "safety",
    });
  }

  if (process.env.CLOVER_SYNC_ENABLED !== "true") {
    actions.push({
      id: "sync-disabled",
      title: "Keep sync planning dry-run",
      detail:
        "CLOVER_SYNC_ENABLED is off, which is correct for testing. Turn it on only after dry-run review.",
      priority: "low",
      area: "safety",
    });
  }

  const score = Math.max(
    0,
    Math.min(
      100,
      100 -
        actions.reduce(
          (total, action) => total + priorityWeight(action.priority),
          0,
        ),
    ),
  );
  const state = getState(score, actions, writesEnabled);

  return {
    generatedAt: new Date().toISOString(),
    readinessScore: score,
    state,
    summary: summarize(state, score),
    actions: actions.sort(
      (a, b) => priorityWeight(b.priority) - priorityWeight(a.priority),
    ),
    checks: {
      auth: {
        allowlistConfigured,
        appleConfigured,
        devLoginEnabled: isEmployeeDevLoginEnabled(),
        googleConfigured,
        passkeyEnabled: false,
      },
      clover: {
        configured: cloverMissing.length === 0,
        env: process.env.CLOVER_ENV || "sandbox",
        missing: cloverMissing,
        syncEnabled: process.env.CLOVER_SYNC_ENABLED === "true",
        writesEnabled,
      },
      imports: {
        latestImportedAt: latestBatch?.importedAt ?? null,
        latestName: latestBatch?.fileName ?? null,
        totalBatches: batches.length,
        warningCount: latestBatch?.summary.warningCount ?? 0,
      },
      medusa,
    },
  };
}
