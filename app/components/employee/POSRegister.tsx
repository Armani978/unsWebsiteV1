"use client";

import {
  Banknote,
  CheckCircle,
  CreditCard,
  Minus,
  Plus,
  Scan,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useStore } from "../../context/StoreContext";
import type { CartItem, Product } from "../../data/types";
import { CATEGORY_LABELS } from "../../data/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

const TAX_RATE = 0.08875;

export default function POSRegister() {
  const { products, addSale } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [payment, setPayment] = useState<"cash" | "card">("card");
  const [cashGiven, setCashGiven] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<{
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    change: number;
  } | null>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const change = Math.max(0, parseFloat(cashGiven || "0") - total);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q);
      return matchCat && matchSearch && p.stock > 0;
    });
  }, [products, search, category]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex)
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i,
        );
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i)),
    );
  };

  const handleBarcode = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const code = (e.target as HTMLInputElement).value.trim();
    const product = products.find((p) => p.barcode === code || p.sku === code);
    if (product && product.stock > 0) {
      addToCart(product);
      setSearch("");
    }
  };

  const completeSale = () => {
    if (cart.length === 0) return;
    const saleData = {
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        sku: i.product.sku,
        price: i.product.price,
        quantity: i.quantity,
      })),
      subtotal,
      tax,
      total,
      paymentMethod: payment,
      cashGiven: payment === "cash" ? parseFloat(cashGiven) : undefined,
      change: payment === "cash" ? change : undefined,
      timestamp: new Date().toISOString(),
      cashier: "Alex R.",
    };
    setLastSale({ items: [...cart], subtotal, tax, total, change });
    addSale(saleData);
    setCart([]);
    setCashGiven("");
    setReceiptOpen(true);
  };

  const categories = [
    "all",
    "vapes",
    "glass",
    "papers",
    "lighters",
    "accessories",
    "hookah",
    "cbd",
    "thca",
  ] as const;

  return (
    <div className="flex h-full bg-background">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col border-r border-border min-w-0">
        {/* Search + scanner */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={barcodeRef}
                placeholder="Search or scan barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleBarcode}
                className="pl-9"
                autoFocus
              />
            </div>
            {search && (
              <Button variant="ghost" size="icon" onClick={() => setSearch("")}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {/* Category filters */}
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs border transition-all ${category === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}
              >
                {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <Scan className="w-8 h-8 opacity-20" />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
              {filtered.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group p-3 border border-border rounded-xl text-left hover:border-primary hover:bg-primary/5 active:scale-95 transition-all"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-20 object-cover rounded-lg mb-2 border border-border/50"
                  />
                  <p className="text-xs font-medium leading-snug line-clamp-2">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-semibold">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs ${product.stock <= 3 ? "text-amber-600" : "text-muted-foreground"}`}
                    >
                      {product.stock}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 xl:w-96 flex flex-col bg-muted/10 shrink-0">
        {/* Cart header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span className="font-medium text-sm">Cart</span>
            {cart.length > 0 && (
              <Badge variant="secondary">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </Badge>
            )}
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => setCart([])}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <ShoppingCart className="w-8 h-8 opacity-20" />
              <p className="text-sm">Add items from the left</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-snug line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${item.product.price.toFixed(2)} ea.
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      updateQty(item.product.id, item.quantity - 1)
                    }
                    className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQty(item.product.id, item.quantity + 1)
                    }
                    className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-xs font-semibold w-14 text-right shrink-0">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => updateQty(item.product.id, 0)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals + payment */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (8.875%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPayment("card")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-all ${payment === "card" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
            >
              <CreditCard className="w-4 h-4" /> Card
            </button>
            <button
              type="button"
              onClick={() => setPayment("cash")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-all ${payment === "cash" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}
            >
              <Banknote className="w-4 h-4" /> Cash
            </button>
          </div>

          {payment === "cash" && (
            <div className="space-y-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="Cash given"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  className="pl-6"
                />
              </div>
              {parseFloat(cashGiven) >= total && (
                <p className="text-sm font-medium text-green-600 text-right">
                  Change: ${change.toFixed(2)}
                </p>
              )}
            </div>
          )}

          <Button
            className="w-full h-12 text-base"
            disabled={
              cart.length === 0 ||
              (payment === "cash" && parseFloat(cashGiven || "0") < total)
            }
            onClick={completeSale}
          >
            Complete Sale — ${total.toFixed(2)}
          </Button>
        </div>
      </div>

      {/* Receipt modal */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Sale Complete
            </DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-4 font-mono text-sm space-y-1.5">
                <div className="text-center font-semibold mb-3">
                  EMBER SMOKE SHOP
                </div>
                <Separator />
                {lastSale.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span className="flex-1 line-clamp-1 text-xs">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span className="text-xs ml-2">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${lastSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tax</span>
                  <span>${lastSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>TOTAL</span>
                  <span>${lastSale.total.toFixed(2)}</span>
                </div>
                {lastSale.change > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>CHANGE</span>
                    <span>${lastSale.change.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={() => setReceiptOpen(false)}>
                New Transaction
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
