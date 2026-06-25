"use client";

import { Activity, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type OpsStatus = {
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
            Live check for Medusa, Clover, imports, and employee login setup.
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
                {statusBadge(status.clover.configured, "Clover creds")}
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
                  ? "Clover credentials are present. Keep writes locked until final testing."
                  : `Missing: ${status.clover.missing.join(", ")}`}
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
                {statusBadge(status.imports.totalBatches > 0, "Daily uploads")}
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
        )}
      </CardContent>
    </Card>
  );
}
