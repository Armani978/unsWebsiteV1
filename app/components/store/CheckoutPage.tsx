"use client";

import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  Clock3,
  CreditCard,
  MapPin,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "../../context/StoreContext";
import type { PickupOrder } from "../../data/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

const pickupWindows = [
  { value: "asap", label: "ASAP, about 20 minutes" },
  { value: "30", label: "In 30 minutes" },
  { value: "60", label: "In 1 hour" },
  { value: "tonight", label: "Later today" },
];

function estimateReadyAt(windowValue: string) {
  const readyAt = new Date();

  if (windowValue === "30") {
    readyAt.setMinutes(readyAt.getMinutes() + 30);
  } else if (windowValue === "60") {
    readyAt.setHours(readyAt.getHours() + 1);
  } else if (windowValue === "tonight") {
    readyAt.setHours(19, 0, 0, 0);
  } else {
    readyAt.setMinutes(readyAt.getMinutes() + 20);
  }

  return readyAt.toISOString();
}

function formatReadyTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function CheckoutPage() {
  const {
    cart,
    cartSubtotal,
    cartTax,
    cartTotal,
    cartCount,
    updateCartQty,
    removeFromCart,
    clearCart,
    addSale,
    createPickupOrder,
  } = useStore();
  const router = useRouter();
  const [step, setStep] = useState<"cart" | "pickup" | "confirm">("cart");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    pickupWindow: "asap",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [placedOrder, setPlacedOrder] = useState<PickupOrder | null>(null);

  const canPlaceOrder = Boolean(form.name.trim() && form.phone.trim());

  const pickupWindowLabel = useMemo(
    () =>
      pickupWindows.find((window) => window.value === form.pickupWindow)
        ?.label ?? pickupWindows[0].label,
    [form.pickupWindow],
  );

  const handlePlaceOrder = () => {
    if (!canPlaceOrder) return;

    const items = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      price: item.product.price,
      quantity: item.quantity,
    }));
    const pickupOrder = createPickupOrder({
      items,
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      paymentMethod,
      customerName: form.name.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      pickupWindow: pickupWindowLabel,
      notes: form.notes.trim() || undefined,
      estimatedReadyAt: estimateReadyAt(form.pickupWindow),
    });

    addSale({
      items,
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      paymentMethod,
      timestamp: new Date().toISOString(),
      cashier: "Online pickup",
      customerName: form.name.trim(),
      pickupOrderId: pickupOrder.id,
    });

    clearCart();
    setPlacedOrder(pickupOrder);
    setStep("confirm");
  };

  if (step === "confirm" && placedOrder) {
    return (
      <main className="bg-[#fbfaf7] px-4 py-12 text-stone-950 sm:px-6">
        <section className="mx-auto max-w-2xl rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#8b733d]">
            Pickup order placed
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-none">
            {placedOrder.id}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-stone-600">
            Thanks {placedOrder.customerName}. Your order is in the pickup queue
            and should be ready around{" "}
            <span className="font-black text-stone-950">
              {formatReadyTime(placedOrder.estimatedReadyAt)}
            </span>
            .
          </p>
          <div className="mt-6 grid gap-3 rounded-lg border border-stone-200 bg-[#fbfaf7] p-4 text-left sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase text-stone-400">
                Pickup
              </p>
              <p className="mt-1 font-semibold">{placedOrder.pickupWindow}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-stone-400">
                Total
              </p>
              <p className="mt-1 font-semibold">
                ${placedOrder.total.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 rounded-md bg-[#111111] font-black uppercase text-white hover:bg-[#3a3124]"
              onClick={() => router.push(`/pickup?order=${placedOrder.id}`)}
            >
              Track pickup
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-stone-300 bg-white font-black uppercase text-stone-950 hover:bg-[#f1eee7]"
            >
              <Link href="/store">Continue shopping</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="bg-[#fbfaf7] px-4 py-20 text-center text-stone-950">
        <Package className="mx-auto mb-4 h-12 w-12 text-stone-300" />
        <p className="mb-4 font-black uppercase">Your cart is empty.</p>
        <Button
          asChild
          variant="outline"
          className="border-stone-300 bg-white text-stone-950 hover:bg-[#f1eee7]"
        >
          <Link href="/store">Back to shop</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="bg-[#fbfaf7] px-4 py-8 text-stone-950 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/store"
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-stone-500 transition-colors hover:text-stone-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#8b733d]">
              In-store pickup
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase leading-none sm:text-5xl">
              {step === "cart" ? "Review your bag" : "Pickup details"}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-black uppercase text-stone-500">
            <Clock3 className="h-3.5 w-3.5 text-[#8b733d]" />
            10 AM-10 PM daily
          </div>
        </div>

        <div className="mb-8 grid max-w-md grid-cols-2 gap-2 text-sm font-black uppercase">
          {(["cart", "pickup"] as const).map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => setStep(item)}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                step === item
                  ? "border-[#b89b5e] bg-[#111111] text-white"
                  : "border-stone-200 bg-white text-stone-500 hover:bg-[#f1eee7]"
              }`}
            >
              <span className="mr-2 text-[#d7bd7a]">0{index + 1}</span>
              {item === "cart" ? "Cart" : "Pickup"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {step === "cart" && (
              <>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-[#eee8dc]">
                      <Image
                        fill
                        unoptimized
                        src={item.product.image}
                        alt={item.product.name}
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-black uppercase leading-snug">
                        {item.product.name}
                      </p>
                      <p className="mt-1 font-mono text-xs uppercase text-stone-400">
                        {item.product.sku}
                      </p>
                      <p className="mt-2 text-sm font-black">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-stone-400 transition-colors hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center overflow-hidden rounded-lg border border-stone-300">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(item.product.id, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center hover:bg-[#f1eee7]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(item.product.id, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center hover:bg-[#f1eee7]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-black">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                <Button
                  className="w-full rounded-md bg-[#111111] font-black uppercase text-white hover:bg-[#3a3124]"
                  onClick={() => setStep("pickup")}
                >
                  Continue to pickup
                </Button>
              </>
            )}

            {step === "pickup" && (
              <div className="space-y-4">
                <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-black uppercase">
                    Contact information
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Your name"
                        className="mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        placeholder="(555) 000-0000"
                        className="mt-1 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email">Email receipt</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="you@example.com"
                        className="mt-1 bg-white"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-black uppercase">Pickup time</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {pickupWindows.map((window) => (
                      <button
                        key={window.value}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            pickupWindow: window.value,
                          }))
                        }
                        className={`rounded-lg border p-3 text-left text-sm font-bold transition ${
                          form.pickupWindow === window.value
                            ? "border-[#b89b5e] bg-[#111111] text-white"
                            : "border-stone-200 bg-[#fbfaf7] text-stone-700 hover:border-[#b89b5e]/60"
                        }`}
                      >
                        {window.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-3 rounded-lg bg-[#fbfaf7] p-3 text-sm text-stone-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8b733d]" />
                    <span>655 S Willow St Unit 115A, Manchester, NH 03103</span>
                  </div>
                </section>

                <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-black uppercase">
                    Payment at pickup
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(["card", "cash"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                          paymentMethod === method
                            ? "border-[#b89b5e] bg-[#f7efd8]"
                            : "border-stone-200 bg-[#fbfaf7] hover:border-[#b89b5e]/60"
                        }`}
                      >
                        {method === "card" ? (
                          <CreditCard className="h-5 w-5 text-[#8b733d]" />
                        ) : (
                          <Banknote className="h-5 w-5 text-[#8b733d]" />
                        )}
                        <span className="text-sm font-black uppercase">
                          {method === "card" ? "Card in store" : "Cash"}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                  <Label htmlFor="notes">Pickup notes</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Flavor substitutions, arrival notes, or anything staff should know."
                    className="mt-2 min-h-24 bg-white"
                  />
                </section>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("cart")}
                    className="w-1/3 border-stone-300 bg-white font-black uppercase text-stone-950 hover:bg-[#f1eee7]"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    className="flex-1 rounded-md bg-[#111111] font-black uppercase text-white hover:bg-[#3a3124]"
                    disabled={!canPlaceOrder}
                  >
                    Place pickup order
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black uppercase">Order summary</h2>
              <ShoppingBag className="h-5 w-5 text-[#8b733d]" />
            </div>
            <div className="space-y-2 text-sm">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between gap-3 text-stone-500"
                >
                  <span className="line-clamp-1">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="shrink-0 font-semibold text-stone-950">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4 bg-stone-200" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal ({cartCount} items)</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Tax</span>
                <span>${cartTax.toFixed(2)}</span>
              </div>
            </div>
            <Separator className="my-4 bg-stone-200" />
            <div className="flex justify-between text-lg font-black">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="mt-5 rounded-lg bg-[#fbfaf7] p-3 text-sm leading-6 text-stone-600">
              Staff will confirm age-restricted items at pickup.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
