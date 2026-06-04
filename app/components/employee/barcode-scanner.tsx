"use client";

import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  PackageCheck,
  Plus,
  RotateCcw,
  ScanBarcode,
  Search,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type ScannerStatus = "idle" | "starting" | "scanning" | "scanned" | "error";
type LookupStatus = "idle" | "loading" | "found" | "new" | "unavailable";

type CloverLookupItem = {
  category?: string;
  code?: string;
  id: string;
  itemStock?: {
    quantity?: number;
  };
  name: string;
  price: number;
  productCode?: string;
  quantity?: number;
  row?: number;
  sku?: string;
};

function formatLookupPrice(item: CloverLookupItem) {
  const price = item.productCode ? item.price : item.price / 100;

  return price.toFixed(2);
}

type ItemForm = {
  sku: string;
  name: string;
  price: string;
  category: string;
  quantity: string;
};

type ItemVariant = {
  id: string;
  category: string;
  value: string;
  sku: string;
  price: string;
  quantity: string;
};

const DEFAULT_FORM: ItemForm = {
  sku: "",
  name: "",
  price: "",
  category: "vapes",
  quantity: "1",
};

const CATEGORIES = [
  { value: "vapes", label: "Vapes" },
  { value: "glass", label: "Glass" },
  { value: "hookah", label: "Hookah" },
  { value: "papers", label: "Papers" },
  { value: "accessories", label: "Accessories" },
  { value: "cbd", label: "CBD" },
];

const VARIANT_CATEGORIES = [
  { value: "color", label: "Color" },
  { value: "size", label: "Size" },
  { value: "flavor", label: "Flavor" },
  { value: "strength", label: "Strength" },
  { value: "material", label: "Material" },
  { value: "custom", label: "Custom" },
];

function getErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Camera permission was denied. Allow camera access and try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to start the scanner.";
}

export default function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [message, setMessage] = useState("Ready to scan with the rear camera.");
  const [form, setForm] = useState<ItemForm>(DEFAULT_FORM);
  const [variants, setVariants] = useState<ItemVariant[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [existingItems, setExistingItems] = useState<CloverLookupItem[]>([]);

  const isScanning = status === "starting" || status === "scanning";
  const scannedCode = form.sku.trim();

  const stopCameraTracks = useCallback(() => {
    const video = videoRef.current;
    const stream =
      video?.srcObject instanceof MediaStream ? video.srcObject : null;

    stream?.getTracks().forEach((track) => {
      track.stop();
    });

    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }, []);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    stopCameraTracks();
    setStatus((current) => (current === "scanned" ? current : "idle"));
    setMessage((current) =>
      current === "Scan captured." ? current : "Scanner stopped.",
    );
  }, [stopCameraTracks]);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      stopCameraTracks();
    };
  }, [stopCameraTracks]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile]);

  const updateField = (field: keyof ItemForm, value: string) => {
    setAdded(false);
    if (field === "sku") {
      setLookupStatus("idle");
      setLookupMessage(null);
      setExistingItems([]);
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  const lookupItem = useCallback(async (code: string) => {
    const normalizedCode = code.trim();

    if (!normalizedCode) return;

    setLookupStatus("loading");
    setLookupMessage("Checking Clover inventory...");
    setExistingItems([]);

    try {
      const response = await fetch(
        `/api/clover/items?code=${encodeURIComponent(normalizedCode)}`,
      );
      const result = await response.json();

      if (!response.ok) {
        setLookupStatus("unavailable");
        setLookupMessage(
          response.status === 503
            ? "Clover inventory is not connected yet. You can still prepare the item form."
            : (result.error ?? "Unable to check Clover inventory."),
        );
        return;
      }

      const items = (result.items ?? []) as CloverLookupItem[];
      setExistingItems(items);

      if (result.found) {
        setLookupStatus("found");
        setLookupMessage(
          result.source === "spreadsheet"
            ? "Item found in the spreadsheet catalog. New-item creation is blocked to prevent duplicates."
            : "Existing Clover item found. New-item creation is blocked to prevent duplicates.",
        );
        return;
      }

      setLookupStatus("new");
      setLookupMessage("Barcode is not in Clover inventory yet.");
    } catch (error) {
      setLookupStatus("unavailable");
      setLookupMessage(
        error instanceof Error
          ? error.message
          : "Unable to check Clover inventory.",
      );
    }
  }, []);

  const addVariant = () => {
    setAdded(false);
    setVariants((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        category: "color",
        value: "",
        sku: "",
        price: "",
        quantity: form.quantity || "1",
      },
    ]);
  };

  const updateVariant = (
    id: string,
    field: keyof Omit<ItemVariant, "id">,
    value: string,
  ) => {
    setAdded(false);
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const removeVariant = (id: string) => {
    setAdded(false);
    setVariants((current) => current.filter((variant) => variant.id !== id));
  };

  const startScanner = async () => {
    setAdded(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setMessage("This browser does not support camera scanning.");
      return;
    }

    if (!videoRef.current) {
      setStatus("error");
      setMessage("Scanner video is not ready yet.");
      return;
    }

    stopScanner();
    lastScannedRef.current = null;
    setStatus("starting");
    setMessage("Starting camera...");

    try {
      const reader = readerRef.current ?? new BrowserMultiFormatReader();
      readerRef.current = reader;

      const controls = await reader.decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
        videoRef.current,
        (result, _error, controlsFromCallback) => {
          if (!result) return;

          const value = result.getText();
          if (!value || lastScannedRef.current === value) return;

          lastScannedRef.current = value;
          controlsFromCallback.stop();
          controlsRef.current = null;
          stopCameraTracks();
          setForm((current) => ({ ...current, sku: value }));
          setStatus("scanned");
          setMessage("Scan captured.");
          void lookupItem(value);
        },
      );

      controlsRef.current = controls;
      setStatus("scanning");
      setMessage("Scanning for UPC, EAN, or barcode...");
    } catch (error) {
      controlsRef.current = null;
      stopCameraTracks();
      setStatus("error");
      setMessage(getErrorMessage(error));
    }
  };

  const scanAgain = () => {
    setForm((current) => ({ ...current, sku: "" }));
    setLookupStatus("idle");
    setLookupMessage(null);
    setExistingItems([]);
    lastScannedRef.current = null;
    void startScanner();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdded(false);
    setPhotoFile(event.target.files?.[0] ?? null);
  };

  const addItem = async () => {
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      price: Number(form.price || 0),
      category: form.category,
      quantity: Number(form.quantity || 0),
      variants: variants
        .filter((variant) => variant.value.trim())
        .map((variant) => ({
          category: variant.category,
          value: variant.value.trim(),
          sku: variant.sku.trim(),
          price: variant.price ? Number(variant.price) : null,
          quantity: variant.quantity ? Number(variant.quantity) : null,
        })),
      photo: photoFile
        ? {
            name: photoFile.name,
            size: photoFile.size,
            type: photoFile.type,
            lastModified: photoFile.lastModified,
          }
        : null,
    };

    console.log("Scanner item", payload);
    setIsAdding(true);
    setApiMessage(null);

    try {
      const response = await fetch("/api/clover/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      console.log("Clover API response", result);

      if (!response.ok) {
        setApiMessage(result.error ?? "Unable to send item to API.");
        setAdded(false);
        return;
      }

      setApiMessage(result.message ?? "Item sent to local API.");
      setAdded(true);
    } catch (error) {
      setApiMessage(
        error instanceof Error ? error.message : "Unable to send item to API.",
      );
      setAdded(false);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>Barcode Scanner</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan inventory labels, attach a product photo, and prepare an item
            payload.
          </p>
        </div>
        <Badge
          variant={
            status === "error"
              ? "destructive"
              : status === "scanned"
                ? "default"
                : "secondary"
          }
        >
          {status === "starting"
            ? "Starting"
            : status === "scanning"
              ? "Scanning"
              : status === "scanned"
                ? "Scanned"
                : status === "error"
                  ? "Error"
                  : "Ready"}
        </Badge>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <ScanBarcode className="size-5" />
              Camera
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] bg-black sm:aspect-video">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
                autoPlay
              />
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center text-white">
                  {status === "scanned" ? (
                    <CheckCircle2 className="size-12 text-green-400" />
                  ) : (
                    <Camera className="size-12 text-white/70" />
                  )}
                  <p className="max-w-sm text-sm text-white/80">{message}</p>
                </div>
              )}
              {isScanning && (
                <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-green-400 shadow-[0_0_24px_rgba(74,222,128,0.95)]" />
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t p-4">
              <Button onClick={startScanner} disabled={isScanning}>
                <Camera className="size-4" />
                Start Scanner
              </Button>
              <Button
                onClick={stopScanner}
                variant="outline"
                disabled={!isScanning}
              >
                <Square className="size-4" />
                Stop Scanner
              </Button>
              <Button onClick={scanAgain} variant="secondary">
                <RotateCcw className="size-4" />
                Scan Again
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Item Form</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="sku">UPC/SKU</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(event) => updateField("sku", event.target.value)}
                placeholder="Scan or enter code"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void lookupItem(form.sku)}
                disabled={!form.sku.trim() || lookupStatus === "loading"}
              >
                {lookupStatus === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Check Clover
              </Button>
              {scannedCode && (
                <p className="text-xs text-muted-foreground">
                  Scanned code: {scannedCode}
                </p>
              )}
              {lookupMessage && (
                <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  {lookupMessage}
                </p>
              )}
              {lookupStatus === "found" &&
                existingItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-green-300/40 bg-green-500/10 px-3 py-2 text-sm"
                  >
                    <p className="flex items-center gap-2 font-medium">
                      <PackageCheck className="size-4 text-green-500" />
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ${formatLookupPrice(item)} · Stock:{" "}
                      {item.itemStock?.quantity ??
                        item.quantity ??
                        "Not tracked"}
                      {item.category ? ` · ${item.category}` : ""}
                    </p>
                  </div>
                ))}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Product name"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(event) =>
                    updateField("quantity", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => updateField("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Variants</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add options like color, size, flavor, or strength.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="size-4" />
                  Add Variant
                </Button>
              </div>

              {variants.length === 0 ? (
                <p className="rounded-md border border-dashed border-border bg-background px-3 py-4 text-center text-sm text-muted-foreground">
                  No variants yet.
                </p>
              ) : (
                <div className="grid gap-3">
                  {variants.map((variant, index) => {
                    const selectedCategory =
                      VARIANT_CATEGORIES.find(
                        (category) => category.value === variant.category,
                      ) ?? VARIANT_CATEGORIES[0];

                    return (
                      <div
                        key={variant.id}
                        className="grid gap-3 rounded-md border border-border bg-background p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            Variant {index + 1}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(variant.id)}
                            aria-label={`Remove variant ${index + 1}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Variant Category</Label>
                            <Select
                              value={variant.category}
                              onValueChange={(value) =>
                                updateVariant(variant.id, "category", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose variant type" />
                              </SelectTrigger>
                              <SelectContent>
                                {VARIANT_CATEGORIES.map((category) => (
                                  <SelectItem
                                    key={category.value}
                                    value={category.value}
                                  >
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`variant-value-${variant.id}`}>
                              {selectedCategory.label}
                            </Label>
                            <Input
                              id={`variant-value-${variant.id}`}
                              value={variant.value}
                              onChange={(event) =>
                                updateVariant(
                                  variant.id,
                                  "value",
                                  event.target.value,
                                )
                              }
                              placeholder={
                                variant.category === "color"
                                  ? "Black, Blue, Red..."
                                  : variant.category === "flavor"
                                    ? "Mint, Mango, Grape..."
                                    : variant.category === "strength"
                                      ? "3%, 5%, 50mg..."
                                      : "Variant option"
                              }
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`variant-sku-${variant.id}`}>
                              Variant SKU
                            </Label>
                            <Input
                              id={`variant-sku-${variant.id}`}
                              value={variant.sku}
                              onChange={(event) =>
                                updateVariant(
                                  variant.id,
                                  "sku",
                                  event.target.value,
                                )
                              }
                              placeholder="Optional"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label htmlFor={`variant-price-${variant.id}`}>
                                Price
                              </Label>
                              <Input
                                id={`variant-price-${variant.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.price}
                                onChange={(event) =>
                                  updateVariant(
                                    variant.id,
                                    "price",
                                    event.target.value,
                                  )
                                }
                                placeholder={form.price || "0.00"}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor={`variant-quantity-${variant.id}`}>
                                Qty
                              </Label>
                              <Input
                                id={`variant-quantity-${variant.id}`}
                                type="number"
                                min="0"
                                value={variant.quantity}
                                onChange={(event) =>
                                  updateVariant(
                                    variant.id,
                                    "quantity",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="photo">Product Photo</Label>
              <label
                htmlFor="photo"
                className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center transition-colors hover:bg-muted/50"
              >
                {photoPreview ? (
                  // biome-ignore lint/performance/noImgElement: Local object URLs from camera uploads cannot be optimized by next/image.
                  <img
                    src={photoPreview}
                    alt="Product preview"
                    className="max-h-44 rounded-md object-contain"
                  />
                ) : (
                  <>
                    <ImagePlus className="size-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Take or upload a product photo
                    </span>
                  </>
                )}
              </label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {photoFile && (
                <p className="text-xs text-muted-foreground">
                  {photoFile.name} - {Math.round(photoFile.size / 1024)} KB
                </p>
              )}
            </div>

            <Button
              onClick={addItem}
              className="w-full"
              disabled={
                !form.sku.trim() || isAdding || lookupStatus === "found"
              }
            >
              <Upload className="size-4" />
              {isAdding ? "Adding..." : "Add Item"}
            </Button>

            {added && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                <CheckCircle2 className="size-4" />
                Item payload logged to the console.
              </div>
            )}

            {apiMessage && (
              <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {apiMessage}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
