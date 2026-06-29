"use client";

import {
  ExternalLink,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    cart,
    cartCount,
    cartTotal,
    cartSubtotal,
    cartTax,
    updateCartQty,
    removeFromCart,
  } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    window.addEventListener("shop-cart-open", openCart);
    return () => window.removeEventListener("shop-cart-open", openCart);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf7] text-stone-950">
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          className="flex w-full flex-col border-stone-200 bg-[#fbfaf7] text-stone-950 sm:w-[440px]"
          style={cartOpen ? { transform: "translateX(0)" } : undefined}
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-stone-950">
              <ShoppingBag className="h-4 w-4 text-[#8b733d]" />
              Cart ({cartCount})
            </SheetTitle>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-stone-500">
              <ShoppingBag className="h-12 w-12 text-stone-300" />
              <p className="text-sm font-semibold">Your cart is empty</p>
              <Button
                variant="outline"
                size="sm"
                className="border-stone-300 bg-white text-stone-950 hover:bg-[#f1eee7]"
                onClick={() => setCartOpen(false)}
              >
                Continue shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto py-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 rounded-lg border border-stone-200 bg-white p-3 shadow-sm"
                  >
                    <div
                      role="img"
                      aria-label={item.product.name}
                      className="h-16 w-16 shrink-0 rounded-md border border-stone-200 bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${item.product.image}")`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold leading-tight text-stone-950">
                        {item.product.name}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-stone-500">
                        ${item.product.price.toFixed(2)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(item.product.id, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded border border-stone-300 text-stone-600 transition-colors hover:bg-[#f1eee7] hover:text-stone-950"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(item.product.id, item.quantity + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded border border-stone-300 text-stone-600 transition-colors hover:bg-[#f1eee7] hover:text-stone-950"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-black text-stone-950">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-stone-400 transition-colors hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-stone-200 border-t pt-4">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Tax (8.875%)</span>
                  <span>${cartTax.toFixed(2)}</span>
                </div>
                <Separator className="bg-stone-200" />
                <div className="flex justify-between font-black text-stone-950">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  className="mt-2 w-full rounded-md bg-[#111111] font-black uppercase text-white hover:bg-[#3a3124]"
                  onClick={() => {
                    setCartOpen(false);
                    router.push("/store/checkout");
                  }}
                >
                  Checkout
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <main className="flex-1">{children}</main>

      <footer className="border-stone-200 border-t bg-[#111111] text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-9 text-sm text-stone-400 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3 text-white">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[#d7bd7a]">
                <Image
                  src="/up-n-smoke-logo.png"
                  alt="Up N Smoke Vapors"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              </span>
              <span className="font-black uppercase">Up N Smoke Vapors</span>
            </div>
            <p className="mt-3 max-w-md leading-6">
              Premium glass, vapes, papers, hookah, CBD, THCA, and pickup-ready
              counter essentials.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d7bd7a]" />
              <div>
                <p className="font-black uppercase text-white">Store info</p>
                <p className="mt-2 leading-6">
                  655 S Willow St Unit 115A
                  <br />
                  Manchester, NH 03103
                  <br />
                  10 AM-10 PM everyday
                  <br />
                  <span className="text-stone-500">Left of Golden Corral</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <a
              href="https://www.upnsmokenh.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-bold uppercase text-[#d7bd7a] transition-colors hover:text-[#ead08a]"
            >
              upnsmokenh.com
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <div className="flex gap-3 text-xs font-black uppercase">
              <a
                href="https://www.upnsmokenh.com/contact"
                target="_blank"
                rel="noreferrer"
                className="text-stone-500 transition-colors hover:text-white"
              >
                Contact
              </a>
              <a
                href="https://www.facebook.com/people/Up-Insmoke/pfbid0LtJ3gbcdee3z487cn3mHiKXYLKLRQKEELUSXU4Rh8TNisd5eXvC526dgWV9Wda57l/"
                target="_blank"
                rel="noreferrer"
                className="text-stone-500 transition-colors hover:text-white"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/upnsmokenh/"
                target="_blank"
                rel="noreferrer"
                className="text-stone-500 transition-colors hover:text-white"
              >
                Instagram
              </a>
            </div>
            <p className="text-xs text-stone-600">
              © 2026 Up N Smoke Vapors. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
