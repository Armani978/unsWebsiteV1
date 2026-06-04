import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12 text-neutral-950">
      <section className="mx-auto max-w-5xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-600 text-white">
          <ShoppingCart className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Cart
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Your pickup cart</h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Cart state is shared with the storefront and will be reserved against
          internal inventory at checkout.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            className="rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
            href="/shop"
          >
            Continue Shopping
          </Link>
          <Link
            className="rounded-md border border-neutral-300 bg-white px-4 py-3 font-semibold text-neutral-950 hover:bg-neutral-100"
            href="/checkout"
          >
            Checkout
          </Link>
        </div>
      </section>
    </main>
  );
}
