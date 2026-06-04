"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

export default function Settings() {
  const [storeName, setStoreName] = useState("EMBER Smoke Shop");
  const [taxRate, setTaxRate] = useState("8.875");
  const [receiptPrint, setReceiptPrint] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(5);
  const [saved, setSaved] = useState(false);
  const [cloverStatus, setCloverStatus] = useState<string | null>(null);
  const [cloverDetails, setCloverDetails] = useState<string | null>(null);
  const [testingClover, setTestingClover] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testCloverConnection = async () => {
    setTestingClover(true);
    setCloverStatus(null);
    setCloverDetails(null);

    try {
      const response = await fetch("/api/clover/status");
      const result = await response.json();

      if (!result.configured) {
        setCloverStatus(`Missing env vars: ${result.missing.join(", ")}`);
        return;
      }

      if (!result.ok) {
        setCloverStatus(
          `Inventory read failed with ${result.capabilities?.inventoryRead?.status ?? "an unknown status"}. Check the token, merchant ID, and environment.`,
        );
        return;
      }

      setCloverStatus(
        `Inventory read connected${result.merchant?.name ? ` to ${result.merchant.name}` : ""}.`,
      );
      setCloverDetails(
        result.writesEnabled
          ? "Live Clover writes are enabled."
          : "Live Clover writes are locked. Scanner submissions stay in dry-run mode.",
      );
    } catch (error) {
      setCloverStatus(
        error instanceof Error
          ? error.message
          : "Unable to test Clover connection.",
      );
    } finally {
      setTestingClover(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1>Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Store configuration and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Store Name</Label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.001"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Low Stock Threshold</Label>
              <Input
                type="number"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(parseInt(e.target.value, 10))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>POS Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Print Receipt After Sale</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically show receipt dialog on POS
              </p>
            </div>
            <Switch checked={receiptPrint} onCheckedChange={setReceiptPrint} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Barcode Scanner Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Auto-submit on Enter key in search field
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clover API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Server-side credentials</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inventory credentials and OAuth secrets remain server-side.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={testCloverConnection}
              disabled={testingClover}
            >
              {testingClover ? "Testing..." : "Test Inventory Read"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.href = "/api/clover/connect";
              }}
            >
              Connect Clover Shop
            </Button>
          </div>
          {cloverStatus && (
            <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              {cloverStatus}
            </p>
          )}
          {cloverDetails && (
            <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              {cloverDetails}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>{saved ? "Saved!" : "Save Settings"}</Button>
      </div>
    </div>
  );
}
