"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Command,
  Heart,
  Menu,
  MessageSquareText,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TextRoll } from "@/components/ui/skiper-ui/skiper58";
import { useStore } from "../context/StoreContext";
import { GridScanOverlay } from "./thegridcn/grid-scan-overlay";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { cn } from "./ui/utils";

const NAV = [
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/pickup", label: "Pickup", icon: PackageCheck },
  { href: "/orders", label: "Orders", icon: Store },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/auth/login", label: "Customer Login", icon: UserRound },
  { href: "/employee/login", label: "Employee Login", icon: UserRound },
] as const;

const SHOP_CATEGORIES = [
  { href: "/store#category-all", label: "All", icon: "inventory" },
  { href: "/store#category-vapes", label: "Vapes", icon: "vape" },
  { href: "/store#category-glass", label: "Glass", icon: "bong" },
  { href: "/store#category-papers", label: "Papers", icon: "papers" },
  { href: "/store#category-lighters", label: "Lighters", icon: "lighter" },
  {
    href: "/store#category-accessories",
    label: "Accessories",
    icon: "grinder",
  },
  { href: "/store#category-hookah", label: "Hookah", icon: "hookah" },
  { href: "/store#category-thca", label: "THCA & Hemp", icon: "pouch" },
  { href: "/store#category-cbd", label: "CBD", icon: "pouch" },
] as const;

const SHOP_TOOLS = [
  { href: "/cart", label: "Cart", icon: "cart" },
  { href: "/pickup", label: "Pickup", icon: "pickup" },
  { href: "/orders", label: "Orders", icon: "orders" },
  { href: "/favorites", label: "Favorites", icon: "favorites" },
  { href: "/reviews", label: "Reviews", icon: "reviews" },
  { href: "/auth/login", label: "Login", icon: "login" },
] as const;

type SmokeIcon =
  | (typeof SHOP_CATEGORIES)[number]["icon"]
  | (typeof SHOP_TOOLS)[number]["icon"];

const MENU_TRANSITION = { duration: 0.28, ease: "easeOut" } as const;

function SmokeCategoryIcon({ icon }: { icon: SmokeIcon }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.3,
  };

  return (
    <svg
      aria-hidden="true"
      className="h-12 w-12 text-zinc-100 drop-shadow-[0_0_14px_rgba(255,255,255,0.12)] transition-colors group-hover:text-yellow-100"
      viewBox="0 0 64 64"
    >
      {icon === "vape" && (
        <g {...common}>
          <path d="M26 8h12l1.5 9v38a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5V17L26 8Z" />
          <path d="M28 17h8" />
          <path d="M29 43h6" />
          <circle cx="32" cy="31" r="4" />
        </g>
      )}
      {icon === "bong" && (
        <g {...common}>
          <path d="M29 8h14v7H31v20L21 52c-2 4 .7 8 5 8h20c4.3 0 7-4 5-8L41 35V15" />
          <path d="M28 52h16" />
          <path d="M44 35l10-10 7 7-10 10" />
          <path d="M50 29l8 8" />
        </g>
      )}
      {icon === "papers" && (
        <g {...common}>
          <path d="M9 34l42-10 4 18-42 10-4-18Z" />
          <path d="M14 38l41-10" />
          <path d="M18 47h24" />
          <path d="M32 43c-4-2-5-5-5-8 4 1 6 4 5 8Z" />
          <path d="M32 43c4-2 5-5 5-8-4 1-6 4-5 8Z" />
        </g>
      )}
      {icon === "lighter" && (
        <g {...common}>
          <path d="M25 27h17v29a5 5 0 0 1-5 5H30a5 5 0 0 1-5-5V27Z" />
          <path d="M29 27v-8h10v8" />
          <path d="M42 33h8" />
          <path d="M50 33c2 0 3 1 3 3v5" />
          <path d="M37 20c1-7 7-9 7-15 6 7 4 13-1 17" />
          <circle cx="36" cy="35" r="3" />
        </g>
      )}
      {icon === "grinder" && (
        <g {...common}>
          <ellipse cx="32" cy="22" rx="18" ry="9" />
          <path d="M14 22v14c0 5 8 9 18 9s18-4 18-9V22" />
          <path d="M18 38c3 4 10 6 18 5" />
          <path d="M24 21l3 3m7-7l2 4m8-1l-3 3m-12 8l-4 2m12 0l3 2" />
        </g>
      )}
      {icon === "hookah" && (
        <g {...common}>
          <path d="M30 9h16" />
          <path d="M34 9v8c0 4-4 6-4 10 0 3 3 5 3 9v12" />
          <path d="M47 9v8c0 4 4 6 4 10" />
          <path d="M21 53h23" />
          <path d="M25 48c0-7 4-10 10-10s10 3 10 10" />
          <path d="M45 31c13-9 24 13 8 22" />
          <path d="M51 27c7-3 12 3 11 10" />
        </g>
      )}
      {icon === "pouch" && (
        <g {...common}>
          <path d="M13 29c0-8 8-14 19-14s19 6 19 14v19c0 8-8 14-19 14s-19-6-19-14V29Z" />
          <path d="M13 29c0 8 8 14 19 14s19-6 19-14" />
          <path d="M24 50h16" />
          <path d="M45 47l10 5m-7-9l8-4" />
        </g>
      )}
      {icon === "inventory" && (
        <g {...common}>
          <path d="M13 20l19-10 19 10-19 10-19-10Z" />
          <path d="M13 20v24l19 10 19-10V20" />
          <path d="M32 30v24" />
          <path d="M23 15l19 10" />
        </g>
      )}
      {icon === "cart" && (
        <g {...common}>
          <path d="M10 13h7l6 31h25l6-21H22" />
          <circle cx="27" cy="53" r="4" />
          <circle cx="47" cy="53" r="4" />
          <path d="M27 31h23" />
        </g>
      )}
      {icon === "pickup" && (
        <g {...common}>
          <path d="M13 20l19-10 19 10-19 10-19-10Z" />
          <path d="M13 20v23l19 11 19-11V20" />
          <path d="M32 30v24" />
          <path d="M47 43h10" />
          <path d="M52 38v10" />
        </g>
      )}
      {icon === "orders" && (
        <g {...common}>
          <path d="M18 8h28v48H18z" />
          <path d="M24 19h16" />
          <path d="M24 29h16" />
          <path d="M24 39h10" />
          <path d="M44 8v8h-8" />
        </g>
      )}
      {icon === "favorites" && (
        <g {...common}>
          <path d="M32 54s-19-11-22-27c-2-10 9-18 17-9l5 6 5-6c8-9 19-1 17 9-3 16-22 27-22 27Z" />
        </g>
      )}
      {icon === "reviews" && (
        <g {...common}>
          <path d="M12 13h40v30H27L15 53V43h-3V13Z" />
          <path d="M22 24h20" />
          <path d="M22 33h14" />
        </g>
      )}
      {icon === "login" && (
        <g {...common}>
          <circle cx="32" cy="22" r="10" />
          <path d="M14 56c3-12 12-18 18-18s15 6 18 18" />
          <path d="M46 18h10" />
          <path d="M52 12l6 6-6 6" />
        </g>
      )}
    </svg>
  );
}

export function SiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [yellowMode, setYellowMode] = useState(true);
  const { cartCount } = useStore();
  const pathname = usePathname();
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const savedMode = window.localStorage.getItem("shop-theme");
    setYellowMode(savedMode !== "stealth");

    const syncTheme = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme?: string }>;
      const nextTheme =
        customEvent.detail?.theme ?? window.localStorage.getItem("shop-theme");
      setYellowMode(nextTheme !== "stealth");
    };

    window.addEventListener("shop-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("shop-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const updateTheme = (checked: boolean) => {
    const theme = checked ? "yellow" : "stealth";
    setYellowMode(checked);
    window.localStorage.setItem("shop-theme", theme);
    window.dispatchEvent(
      new CustomEvent("shop-theme-change", { detail: { theme } }),
    );
  };

  if (pathname.startsWith("/employee/") && pathname !== "/employee/login") {
    return null;
  }

  return (
    <>
      <header className="dark sticky top-0 z-50 flex h-[72px] shrink-0 items-center justify-center px-3 text-white">
        <nav
          aria-label="Site navigation"
          className="flex h-[54px] w-full max-w-6xl items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#131514]/90 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:px-4"
        >
          <Link href="/shop" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-yellow-300">
              <Image
                src="/up-n-smoke-logo.png"
                alt="Up N Smoke Vapors"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </span>
            <span className="truncate text-sm font-black uppercase">
              Up N Smoke Vapors
            </span>
          </Link>

          <div className="ml-auto hidden items-center gap-5 text-xs font-medium text-zinc-400 sm:flex">
            <Link href="/shop" className="transition-colors hover:text-white">
              Shop
            </Link>
            <Link href="/cart" className="transition-colors hover:text-white">
              Cart
            </Link>
            <Link
              href="/auth/login"
              className="transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/employee/login"
              className="transition-colors hover:text-white"
            >
              Employee Login
            </Link>
          </div>

          {(pathname.startsWith("/store") || pathname.startsWith("/shop")) && (
            <>
              <div className="hidden items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-[10px] font-black uppercase text-zinc-300 md:flex">
                <span>{yellowMode ? "Yellow" : "Stealth"}</span>
                <Switch
                  checked={yellowMode}
                  onCheckedChange={updateTheme}
                  aria-label="Toggle customer shop theme"
                  className="data-[state=checked]:bg-yellow-300 data-[state=unchecked]:bg-zinc-700"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  window.dispatchEvent(new Event("shop-cart-open"))
                }
                className="relative h-8 gap-1.5 rounded-md border-white/[0.08] bg-white/[0.04] px-2.5 text-xs font-black uppercase text-zinc-200 hover:bg-white/10 hover:text-white"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Cart</span>
                {cartCount > 0 && (
                  <Badge className="-right-2 -top-2 absolute flex h-5 w-5 items-center justify-center border-yellow-300 bg-yellow-300 p-0 text-[10px] text-black">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </>
          )}

          <button
            type="button"
            aria-label="Open command navigation"
            className="hidden h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white sm:flex"
            onClick={() => setMenuOpen(true)}
          >
            <Command className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Open site menu"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="dark fixed inset-0 z-[100] overflow-hidden bg-[#080a09] text-white"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={MENU_TRANSITION}
          >
            <GridScanOverlay gridSize={64} scanSpeed={13} />
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex h-[72px] items-center justify-between px-4 md:px-6">
                <Link
                  href="/shop"
                  className="flex items-center gap-2"
                  onClick={closeMenu}
                >
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-yellow-300">
                    <Image
                      src="/up-n-smoke-logo.png"
                      alt="Up N Smoke Vapors"
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  </span>
                  <span className="text-sm font-black uppercase text-white">
                    Up N Smoke Vapors
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label="Close site menu"
                  className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                  onClick={closeMenu}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8 sm:px-10 lg:px-[12vw]">
                <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-yellow-300">
                  Main navigation
                </p>
                <nav className="max-w-4xl space-y-1" aria-label="Main menu">
                  {NAV.map(({ href, label, icon: Icon }, index) => (
                    <motion.div
                      key={href}
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 18 }}
                      transition={{
                        delay: 0.06 + index * 0.045,
                        duration: 0.28,
                        ease: "easeOut",
                      }}
                    >
                      <Link
                        href={href}
                        onClick={closeMenu}
                        className={cn(
                          "group flex items-center gap-4 border-b border-white/10 py-3 text-3xl font-black uppercase leading-none transition-colors sm:text-4xl lg:text-5xl",
                          pathname === href
                            ? "text-yellow-300"
                            : "text-zinc-100 hover:text-yellow-200",
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0 text-zinc-600 transition-colors group-hover:text-yellow-300" />
                        <TextRoll>{label}</TextRoll>
                        <span className="ml-auto font-mono text-xs font-normal text-zinc-600 transition-colors group-hover:text-yellow-300">
                          0{index + 1}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 max-w-5xl"
                  initial={{ opacity: 0, y: 12 }}
                  transition={{ delay: 0.34, duration: 0.28 }}
                >
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    Shop categories
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {SHOP_CATEGORIES.map((category) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        onClick={closeMenu}
                        className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-4 text-center text-xs font-black uppercase tracking-[0.12em] text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-yellow-300/50 hover:bg-yellow-300/10 hover:text-yellow-100"
                      >
                        <SmokeCategoryIcon icon={category.icon} />
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 max-w-5xl"
                  initial={{ opacity: 0, y: 12 }}
                  transition={{ delay: 0.38, duration: 0.28 }}
                >
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                    Customer tools
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {SHOP_TOOLS.map((tool) => (
                      <Link
                        key={`${tool.href}-${tool.label}`}
                        href={tool.href}
                        onClick={closeMenu}
                        className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/32 px-2 py-3 text-center text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-yellow-300/50 hover:bg-yellow-300/10 hover:text-yellow-100"
                      >
                        <SmokeCategoryIcon icon={tool.icon} />
                        {tool.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex items-center gap-2 text-sm text-zinc-500"
                  initial={{ opacity: 0, y: 12 }}
                  transition={{ delay: 0.42, duration: 0.28 }}
                >
                  <Store className="h-4 w-4 text-yellow-300" />
                  Storefront, pickup, and customer account tools in one place.
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
