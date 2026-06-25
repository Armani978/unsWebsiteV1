"use client";

import { FileSpreadsheet, Loader2, RefreshCw, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type ImportBatchSummary = {
  id: string;
  fileName: string;
  importedAt: string;
  status: string;
  dryRun: boolean;
  summary: {
    totalRows: number;
    normalizedRows: number;
    warningCount: number;
    missingName: number;
    missingSkuOrBarcode: number;
    missingPrice: number;
    missingQuantity: number;
    categories: Record<string, number>;
  };
};

type SyncPlan = {
  batchId: string;
  generatedAt: string;
  cloverConfigured: boolean;
  writesEnabled: boolean;
  message: string;
  counts: Record<string, number>;
  items: Array<{
    action: string;
    reason: string;
    row: {
      sourceRow: number;
      name: string;
      sku: string;
      barcode: string;
      cloverCategory: string;
      quantity: number | null;
      price: number | null;
    };
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function countLabel(plan: SyncPlan | null) {
  if (!plan) return "No sync plan generated yet.";

  return [
    `${plan.counts.create ?? 0} create`,
    `${plan.counts.update ?? 0} update`,
    `${plan.counts["stock-update"] ?? 0} stock`,
    `${plan.counts.match ?? 0} match`,
    `${plan.counts["needs-review"] ?? 0} review`,
    `${plan.counts.skip ?? 0} skip`,
  ].join(" · ");
}

export default function InventoryImportPanel() {
  const [batches, setBatches] = useState<ImportBatchSummary[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [plan, setPlan] = useState<SyncPlan | null>(null);

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === selectedBatchId) ?? batches[0],
    [batches, selectedBatchId],
  );

  const loadBatches = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/inventory/imports");
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error ?? "Unable to load imports.");
        return;
      }

      setBatches(result.batches ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load imports.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  const uploadImport = async () => {
    if (!file) {
      setMessage("Choose an XLSX or CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setUploading(true);
    setMessage(null);
    setPlan(null);

    try {
      const response = await fetch("/api/inventory/imports", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error ?? "Unable to upload inventory file.");
        return;
      }

      setFile(null);
      setSelectedBatchId(result.batch.id);
      setMessage(
        `Imported ${result.batch.summary.normalizedRows} rows from ${result.batch.fileName}.`,
      );
      await loadBatches();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload inventory file.",
      );
    } finally {
      setUploading(false);
    }
  };

  const generatePlan = async () => {
    if (!selectedBatch) {
      setMessage("Upload an inventory file before generating a Clover plan.");
      return;
    }

    setPlanning(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/inventory/imports/${selectedBatch.id}/clover-sync-plan?limit=100`,
        { method: "POST" },
      );
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error ?? "Unable to create Clover sync plan.");
        return;
      }

      setPlan(result.plan);
      setMessage(result.plan.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create Clover sync plan.",
      );
    } finally {
      setPlanning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="size-5 text-yellow-600" />
          Daily Inventory Uploads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border border-yellow-300/40 bg-yellow-50 px-3 py-2 text-sm text-zinc-800">
          Upload daily XLSX or CSV files here. Clover remains the source of
          truth; this builds an import snapshot and a dry-run Clover sync plan.
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid gap-2">
            <Label htmlFor="inventory-upload">Inventory file</Label>
            <Input
              id="inventory-upload"
              type="file"
              accept=".csv,.xlsx"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <Button onClick={uploadImport} disabled={uploading || !file}>
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Upload
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            {selectedBatch
              ? `Selected: ${selectedBatch.fileName}`
              : "No inventory uploads yet."}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={loadBatches}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Refresh
            </Button>
            <Button
              type="button"
              onClick={generatePlan}
              disabled={planning || !selectedBatch}
            >
              {planning ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Clover Dry Run
            </Button>
          </div>
        </div>

        {message && (
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        )}

        {plan && (
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={plan.cloverConfigured ? "secondary" : "destructive"}
              >
                {plan.cloverConfigured
                  ? "Clover connected"
                  : "Clover not configured"}
              </Badge>
              <Badge variant={plan.writesEnabled ? "destructive" : "outline"}>
                {plan.writesEnabled ? "Writes env-enabled" : "Writes locked"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {countLabel(plan)}
              </span>
            </div>

            <div className="mt-3 max-h-72 overflow-auto rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU/UPC</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.items.slice(0, 25).map((item) => (
                    <TableRow key={`${item.row.sourceRow}-${item.action}`}>
                      <TableCell>
                        <Badge variant="outline">{item.action}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.row.name || `Row ${item.row.sourceRow}`}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.row.sku || item.row.barcode || "-"}
                      </TableCell>
                      <TableCell>{item.row.cloverCategory}</TableCell>
                      <TableCell className="max-w-80 whitespace-normal text-muted-foreground">
                        {item.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Warnings</TableHead>
                <TableHead>Imported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No uploads yet.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow
                    key={batch.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedBatchId(batch.id);
                      setPlan(null);
                    }}
                  >
                    <TableCell className="font-medium">
                      {batch.fileName}
                    </TableCell>
                    <TableCell>{batch.summary.normalizedRows}</TableCell>
                    <TableCell>{batch.summary.warningCount}</TableCell>
                    <TableCell>{formatDate(batch.importedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
