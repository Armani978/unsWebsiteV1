"use client";

import {
  Flame,
  LayoutDashboard,
  LogOut,
  Package,
  PackageCheck,
  Palette,
  Receipt,
  ScanBarcode,
  Settings,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridScanOverlay } from "../thegridcn/grid-scan-overlay";
import { Separator } from "../ui/separator";
import { cn } from "../ui/utils";

const NAV = [
  { to: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employee/pos", label: "POS System", icon: ShoppingCart },
  { to: "/employee/scanner", label: "Barcode Scanner", icon: ScanBarcode },
  { to: "/employee/inventory", label: "Inventory", icon: Package },
  { to: "/employee/pickups", label: "Pickups", icon: PackageCheck },
  { to: "/employee/ui-schemes", label: "UI Schemes", icon: Palette },
  { to: "/employee/sales", label: "Sales History", icon: Receipt },
  { to: "/employee/customers", label: "Customers", icon: Users },
] as const;

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (to: string) => pathname === to;

  const sidebar = (
    <nav className="relative z-10 flex h-full flex-col">
      <div className="flex items-start justify-between px-5 pb-5 pt-6">
        <Link href="/employee/dashboard" className="group block">
          <div className="flex items-center gap-2 text-lime-300">
            <Flame className="h-6 w-6 fill-lime-300/15" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-lime-200/75">
              Staff terminal
            </span>
          </div>
          <div className="mt-2 text-[28px] font-black uppercase leading-[0.82] text-white">
            <span className="text-lime-300">Up N</span>
            <br />
            Smoke
          </div>
        </Link>
      </div>

      <Separator className="bg-white/10" />

      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            href={to}
            className={cn(
              "group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm transition-all duration-200",
              isActive(to)
                ? "border-lime-400/20 bg-lime-400/10 font-semibold text-lime-300 shadow-[inset_3px_0_0_#a3e635]"
                : "text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </div>

      <div className="mx-3 mb-3 rounded-lg border border-violet-400/20 bg-violet-500/10 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
          Daily vibes
        </p>
        <p className="mt-2 text-sm leading-5 text-zinc-200">
          Good vibes,
          <br />
          great sales.
        </p>
      </div>

      <div className="space-y-1 p-3 pt-0">
        <Link
          href="/employee/settings"
          className={cn(
            "flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm transition-all",
            isActive("/employee/settings")
              ? "border-lime-400/20 bg-lime-400/10 font-semibold text-lime-300"
              : "text-zinc-400 hover:bg-white/[0.04] hover:text-white",
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/store"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-400 transition-all hover:bg-white/[0.04] hover:text-white"
        >
          <Store className="h-4 w-4" />
          View Storefront
        </Link>
      </div>

      <Separator className="bg-white/10" />
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-lime-300/40 bg-lime-300/15 text-xs font-bold text-lime-200">
          AR
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Alex R.</p>
          <p className="text-xs text-zinc-500">Manager on duty</p>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="dark flex h-screen overflow-hidden bg-[#080a09] text-zinc-100">
      <aside className="relative hidden w-64 shrink-0 overflow-hidden border-r border-white/10 bg-[#101210] lg:flex lg:flex-col">
        <GridScanOverlay gridSize={54} scanSpeed={16} />
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-30 border-white/10 border-b bg-[#101210]/95 px-3 py-3 backdrop-blur lg:hidden">
          <GridScanOverlay
            className="opacity-60"
            gridSize={46}
            scanSpeed={18}
          />
          <div className="relative flex items-center justify-between gap-3">
            <Link
              href="/employee/dashboard"
              className="flex min-w-0 items-center gap-2 text-lime-300"
            >
              <Flame className="h-6 w-6 shrink-0 fill-lime-300/15" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black uppercase leading-none text-white">
                  Up N Smoke
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-lime-200/70">
                  Staff terminal
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/store"
                aria-label="View storefront"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Store className="h-4 w-4" />
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  aria-label="Log out"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
          <nav
            aria-label="Staff sections"
            className="relative mt-3 flex gap-2 overflow-x-auto pb-1"
          >
            {[
              ...NAV,
              { to: "/employee/settings", label: "Settings", icon: Settings },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                href={to}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition-colors",
                  isActive(to)
                    ? "border-lime-400/30 bg-lime-400/12 text-lime-200"
                    : "border-white/10 bg-black/25 text-zinc-400 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
