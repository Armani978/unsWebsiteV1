"use client";

import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import type { PickupOrder, PickupStatus } from "../../data/types";
import { Button } from "../ui/button";

const nextStatus: Partial<Record<PickupStatus, PickupStatus>> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "completed",
  arrived: "completed",
};

const actionLabel: Partial<Record<PickupStatus, string>> = {
  pending: "Accept order",
  accepted: "Start prep",
  preparing: "Mark ready",
  ready: "Complete pickup",
  arrived: "Complete pickup",
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function PickupCard({ order }: { order: PickupOrder }) {
  const { updatePickupStatus } = useStore();
  const next = nextStatus[order.status];

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">{order.id}</h2>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold uppercase text-primary">
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.customerName} · {order.items.length} item
            {order.items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {next && (
            <Button
              size="sm"
              onClick={() => updatePickupStatus(order.id, next)}
            >
              {actionLabel[order.status]}
            </Button>
          )}
          {order.status !== "cancelled" && order.status !== "completed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updatePickupStatus(order.id, "cancelled")}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md bg-muted/30 p-3">
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2 text-xs font-medium uppercase text-muted-foreground">
            Ready target
          </p>
          <p className="mt-1 font-semibold">
            {formatTime(order.estimatedReadyAt)}
          </p>
        </div>
        <div className="rounded-md bg-muted/30 p-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2 text-xs font-medium uppercase text-muted-foreground">
            Phone
          </p>
          <p className="mt-1 font-semibold">{order.customerPhone}</p>
        </div>
        <div className="rounded-md bg-muted/30 p-3">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2 text-xs font-medium uppercase text-muted-foreground">
            Total
          </p>
          <p className="mt-1 font-semibold">${order.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {order.items.map((item) => (
          <div
            key={`${order.id}-${item.productId}`}
            className="flex justify-between gap-3 rounded-md border border-border bg-background p-3 text-sm"
          >
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.sku} · Qty {item.quantity}
              </p>
            </div>
            <p className="font-semibold">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {order.notes}
        </div>
      )}
    </article>
  );
}

export default function PickupQueue() {
  const { pickupOrders } = useStore();

  const grouped = useMemo(() => {
    const active = pickupOrders.filter(
      (order) => order.status !== "completed" && order.status !== "cancelled",
    );
    const done = pickupOrders.filter(
      (order) => order.status === "completed" || order.status === "cancelled",
    );
    return { active, done };
  }, [pickupOrders]);

  return (
    <main className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              In-store pickup
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Pickup queue</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-border bg-background px-4 py-3">
              <p className="text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold">{grouped.active.length}</p>
            </div>
            <div className="rounded-md border border-border bg-background px-4 py-3">
              <p className="text-muted-foreground">Closed</p>
              <p className="text-2xl font-semibold">{grouped.done.length}</p>
            </div>
          </div>
        </div>
      </section>

      {pickupOrders.length === 0 ? (
        <section className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <PackageCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold">No pickup orders yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Customer pickup orders will appear here after checkout.
          </p>
        </section>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Active orders</h2>
            </div>
            {grouped.active.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
                No active pickup orders.
              </div>
            ) : (
              grouped.active.map((order) => (
                <PickupCard key={order.id} order={order} />
              ))
            )}
          </section>

          {grouped.done.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold">Completed and cancelled</h2>
              </div>
              {grouped.done.map((order) => (
                <PickupCard key={order.id} order={order} />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
