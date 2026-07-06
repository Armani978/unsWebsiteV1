"use client";

import {
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { useStore } from "../context/StoreContext";
import type { PickupOrder, PickupStatus } from "../data/types";

const statusSteps: Array<{ status: PickupStatus; label: string }> = [
  { status: "pending", label: "Received" },
  { status: "accepted", label: "Accepted" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "arrived", label: "Arrived" },
  { status: "completed", label: "Complete" },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusIndex(status: PickupStatus) {
  return statusSteps.findIndex((step) => step.status === status);
}

function PickupStatusRail({ order }: { order: PickupOrder }) {
  const current = statusIndex(order.status);

  return (
    <div className="grid gap-2 sm:grid-cols-6">
      {statusSteps.map((step, index) => {
        const complete = index <= current;
        return (
          <div
            key={step.status}
            className={`rounded-lg border p-3 ${
              complete
                ? "border-[#b89b5e] bg-[#111111] text-white"
                : "border-stone-200 bg-white text-stone-400"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.14em]">
                0{index + 1}
              </span>
              {complete && <CheckCircle2 className="h-4 w-4 text-[#d7bd7a]" />}
            </div>
            <p className="mt-2 text-xs font-black uppercase">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function PickupOrderCard({
  order,
  active,
  onSelect,
}: {
  order: PickupOrder;
  active: boolean;
  onSelect: (orderId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(order.id)}
      className={`w-full rounded-lg border p-4 text-left transition ${
        active
          ? "border-[#b89b5e] bg-[#f7efd8]"
          : "border-stone-200 bg-white hover:border-[#b89b5e]/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black uppercase text-stone-950">{order.id}</p>
          <p className="mt-1 text-xs font-semibold text-stone-500">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span className="rounded bg-[#111111] px-2 py-1 text-[10px] font-black uppercase text-white">
          {order.status}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-stone-600">
        {order.items.length} item{order.items.length !== 1 ? "s" : ""} · $
        {order.total.toFixed(2)}
      </p>
    </button>
  );
}

export default function PickupPage() {
  const { pickupOrders, updatePickupStatus } = useStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const queryOrder = new URLSearchParams(window.location.search).get("order");
    setSelectedOrderId(queryOrder);
  }, []);

  const selectedOrder = useMemo(() => {
    if (pickupOrders.length === 0) return null;
    return (
      pickupOrders.find((order) => order.id === selectedOrderId) ??
      pickupOrders[0]
    );
  }, [pickupOrders, selectedOrderId]);

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-stone-950 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#8b733d]">
              In-store pickup
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl">
              Pickup tracker
            </h1>
          </div>
          <Button
            asChild
            className="w-fit rounded-md bg-[#111111] font-black uppercase text-white hover:bg-[#3a3124]"
          >
            <Link href="/store">Start an order</Link>
          </Button>
        </div>

        {pickupOrders.length === 0 || !selectedOrder ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-stone-300" />
            <h2 className="text-2xl font-black uppercase">
              No pickup orders yet
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-600">
              Add items to your bag and choose in-store pickup at checkout.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-3">
              {pickupOrders.map((order) => (
                <PickupOrderCard
                  key={order.id}
                  order={order}
                  active={order.id === selectedOrder.id}
                  onSelect={setSelectedOrderId}
                />
              ))}
            </aside>

            <div className="space-y-5">
              <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-black uppercase text-stone-400">
                      Order
                    </p>
                    <h2 className="mt-1 text-3xl font-black uppercase">
                      {selectedOrder.id}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-stone-500">
                      Placed {formatDateTime(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-[#fbfaf7] px-4 py-3 text-right">
                    <p className="text-xs font-black uppercase text-stone-400">
                      Estimated ready
                    </p>
                    <p className="mt-1 text-xl font-black">
                      {formatDateTime(selectedOrder.estimatedReadyAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <PickupStatusRail order={selectedOrder} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-[#fbfaf7] p-3">
                    <Clock3 className="h-4 w-4 text-[#8b733d]" />
                    <p className="mt-2 text-xs font-black uppercase text-stone-400">
                      Window
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {selectedOrder.pickupWindow}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#fbfaf7] p-3">
                    <Phone className="h-4 w-4 text-[#8b733d]" />
                    <p className="mt-2 text-xs font-black uppercase text-stone-400">
                      Contact
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {selectedOrder.customerPhone}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#fbfaf7] p-3">
                    <MapPin className="h-4 w-4 text-[#8b733d]" />
                    <p className="mt-2 text-xs font-black uppercase text-stone-400">
                      Store
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      655 S Willow St Unit 115A
                    </p>
                  </div>
                </div>

                {selectedOrder.status === "ready" && (
                  <Button
                    className="mt-5 rounded-md bg-[#111111] font-black uppercase text-white hover:bg-[#3a3124]"
                    onClick={() =>
                      updatePickupStatus(selectedOrder.id, "arrived")
                    }
                  >
                    I am at the store
                  </Button>
                )}
              </section>

              <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black uppercase">Bag details</h2>
                  <PackageCheck className="h-5 w-5 text-[#8b733d]" />
                </div>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={`${selectedOrder.id}-${item.productId}`}
                      className="flex justify-between gap-4 rounded-lg bg-[#fbfaf7] p-3 text-sm"
                    >
                      <div>
                        <p className="font-black uppercase">
                          {item.productName}
                        </p>
                        <p className="mt-1 font-mono text-xs text-stone-400">
                          {item.sku} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-black">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4 bg-stone-200" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </section>

              {selectedOrder.notes && (
                <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-black uppercase">Pickup notes</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {selectedOrder.notes}
                  </p>
                </section>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
