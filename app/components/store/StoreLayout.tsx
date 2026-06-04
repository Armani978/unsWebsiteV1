"use client";

import {
  ExternalLink,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
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
  const [yellowMode, setYellowMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    const syncTheme = (event?: Event) => {
      const customEvent = event as CustomEvent<{ theme?: string }> | undefined;
      const theme =
        customEvent?.detail?.theme ?? window.localStorage.getItem("shop-theme");
      setYellowMode(theme !== "stealth");
    };

    syncTheme();
    window.addEventListener("shop-cart-open", openCart);
    window.addEventListener("shop-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("shop-cart-open", openCart);
      window.removeEventListener("shop-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const themeVars = {
    "--shop-page-bg": yellowMode ? "#facc15" : "#080908",
    "--shop-page-text": yellowMode ? "#09090b" : "#ffffff",
    "--shop-page-muted": yellowMode ? "#3f3f46" : "#71717a",
    "--shop-page-border": yellowMode
      ? "rgba(0,0,0,0.16)"
      : "rgba(255,255,255,0.08)",
    "--shop-footer-bg": yellowMode ? "#09090b" : "#0d0f0d",
    "--shop-hero-bg": yellowMode ? "#facc15" : "#080908",
    "--shop-hero-text": yellowMode ? "#09090b" : "#ffffff",
    "--shop-hero-muted": yellowMode ? "#27272a" : "#d4d4d8",
    "--shop-grid-opacity": yellowMode ? "0.42" : "0.28",
  } as CSSProperties;

  return (
    <div
      className="dark flex min-h-screen flex-col text-white"
      style={themeVars}
    >
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex w-full flex-col border-white/10 bg-[#0d0f0d] text-white sm:w-[420px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-white">
              <ShoppingCart className="h-4 w-4 text-yellow-300" />
              Cart ({cartCount})
            </SheetTitle>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Your cart is empty</p>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/10 hover:text-white"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto py-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 rounded-lg border border-white/[0.08] bg-[#121413] p-3"
                  >
                    <div
                      role="img"
                      aria-label={item.product.name}
                      className="h-16 w-16 shrink-0 rounded-md border border-white/10 bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${item.product.image}")`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-tight">
                        {item.product.name}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-400">
                        ${item.product.price.toFixed(2)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(item.product.id, item.quantity - 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded border border-white/10 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(item.product.id, item.quantity + 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded border border-white/10 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-zinc-500 transition-colors hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Tax (8.875%)</span>
                  <span>${cartTax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  className="mt-2 w-full rounded-md bg-yellow-300 font-black uppercase text-black hover:bg-yellow-200"
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

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[var(--shop-footer-bg)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-zinc-400 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-yellow-300">
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
              Major vape brands, premium glass, certified barcode-scannable
              products, and customer service built around making pickup easy.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
              <div>
                <p className="font-black uppercase text-white">Store info</p>
                <p className="mt-2 leading-6">
                  655 S Willow St Unit 115A
                  <br />
                  Manchester, NH 03103
                  <br />
                  10 AM-10 PM everyday
                  <br />
                  <span className="text-zinc-500">Left of Golden Corral</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <a
              href="https://www.upnsmokenh.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-bold uppercase text-yellow-300 transition-colors hover:text-yellow-100"
            >
              upnsmokenh.com
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <div className="flex gap-3 text-xs font-black uppercase">
              <a
                href="https://www.upnsmokenh.com/contact"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 transition-colors hover:text-white"
              >
                Contact
              </a>
              <a
                href="https://www.facebook.com/people/Up-Insmoke/pfbid0LtJ3gbcdee3z487cn3mHiKXYLKLRQKEELUSXU4Rh8TNisd5eXvC526dgWV9Wda57l/"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 transition-colors hover:text-white"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/upnsmokenh/"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 transition-colors hover:text-white"
              >
                Instagram
              </a>
            </div>
            <p className="text-xs text-zinc-600">
              © 2026 Up N Smoke Vapors. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
