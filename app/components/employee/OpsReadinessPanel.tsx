"use client";

import { Activity, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type OpsStatus = {
  actions?: Array<{
    area: string;
    detail: string;
    id: string;
    priority: "high" | "medium" | "low";
    title: string;
  }>;
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
  };
  medusa: {
    configured: boolean;
    error?: string;
    ok: boolean;
    status: number | null;
    url: string | null;
  };
  readinessScore?: number;
  state?: "blocked" | "setup" | "ready" | "live-risk";
  summary?: string;
};

function statusBadge(ok: boolean, label: string) {
  return (
    <Badge variant={ok ? "secondary" : "destructive"}>
      {ok ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <XCircle className="size-3" />
      )}
      {label}
    </Badge>
  );
}

function formatDate(value: string | null) {
  if (!value) return "No uploads yet";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function priorityClass(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  if (priority === "medium") {
    return "border-yellow-300/40 bg-yellow-300/10 text-yellow-700 dark:text-yellow-300";
  }

  return "border-border bg-muted/30 text-muted-foreground";
}

export default function OpsReadinessPanel() {
  const [status, setStatus] = useState<OpsStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/ops/status", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error ?? "Unable to load operations status.");
        return;
      }

      setStatus(result);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load operations status.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5 text-yellow-600" />
          Operations Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Live check for the website backend, Clover merchant connection,
            imports, and employee login setup.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={loadStatus}
            disabled={loading}
          >
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
        </div>

        {message && (
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        )}

        {status && (
          <div className="space-y-3">
            {typeof status.readinessScore === "number" && (
              <div className="rounded-lg border border-yellow-300/30 bg-yellow-300/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      Operations readiness
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {status.summary}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {status.readinessScore}% · {status.state}
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <div className="flex flex-wrap gap-2">
                  {statusBadge(status.medusa.ok, "Medusa")}
                  <Badge variant="outline">
                    {status.medusa.url ?? "No MEDUSA_BACKEND_URL"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {status.medusa.ok
                    ? `Backend health returned ${status.medusa.status}.`
                    : (status.medusa.error ?? "Medusa is not reachable yet.")}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex flex-wrap gap-2">
                  {statusBadge(status.clover.configured, "Clover merchant")}
                  <Badge variant="outline">{status.clover.env}</Badge>
                  <Badge
                    variant={
                      status.clover.writesEnabled ? "destructive" : "outline"
                    }
                  >
                    {status.clover.writesEnabled
                      ? "Writes enabled"
                      : "Writes locked"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {status.clover.configured
                    ? "Clover merchant credentials are present for this website. Keep writes locked until final testing."
                    : `Website connection missing: ${status.clover.missing.join(", ")}`}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex flex-wrap gap-2">
                  {statusBadge(
                    status.auth.googleConfigured || status.auth.appleConfigured,
                    "Provider login",
                  )}
                  <Badge
                    variant={
                      status.auth.devLoginEnabled ? "secondary" : "outline"
                    }
                  >
                    {status.auth.devLoginEnabled
                      ? "Dev login on"
                      : "Dev login off"}
                  </Badge>
                  <Badge variant="outline">Passkey planned</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {status.auth.allowlistConfigured
                    ? "Employee allowlist is configured."
                    : "Set employee email/domain allowlist before real provider login."}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex flex-wrap gap-2">
                  {statusBadge(
                    status.imports.totalBatches > 0,
                    "Daily uploads",
                  )}
                  <Badge variant="outline">
                    {status.imports.totalBatches} batches
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Latest: {status.imports.latestName ?? "none"} ·{" "}
                  {formatDate(status.imports.latestImportedAt)}
                </p>
              </div>
            </div>

            {status.actions && status.actions.length > 0 && (
              <div className="rounded-lg border p-3">
                <p className="text-sm font-semibold">Next action queue</p>
                <div className="mt-3 grid gap-2">
                  {status.actions.slice(0, 5).map((action) => (
                    <div
                      key={action.id}
                      className={`rounded-md border px-3 py-2 ${priorityClass(action.priority)}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{action.title}</p>
                        <Badge variant="outline">{action.priority}</Badge>
                      </div>
                      <p className="mt-1 text-xs opacity-80">{action.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
