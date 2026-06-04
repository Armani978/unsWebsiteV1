"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Crown,
  Gift,
  Package,
  ScanBarcode,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { REVENUE_DATA } from "../../data/mockData";
import { CATEGORY_LABELS } from "../../data/types";
import { GlowContainer } from "../thegridcn/glow-container";
import { GridScanOverlay } from "../thegridcn/grid-scan-overlay";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const PANEL_TITLE =
  "font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-100";

const METRIC_STYLES = {
  lime: {
    border: "border-lime-400/20",
    icon: "text-lime-300",
    iconBg: "bg-lime-400/10",
    text: "text-lime-300",
  },
  violet: {
    border: "border-violet-400/20",
    icon: "text-violet-300",
    iconBg: "bg-violet-400/10",
    text: "text-violet-300",
  },
  amber: {
    border: "border-amber-400/20",
    icon: "text-amber-300",
    iconBg: "bg-amber-400/10",
    text: "text-amber-300",
  },
  pink: {
    border: "border-pink-400/20",
    icon: "text-pink-300",
    iconBg: "bg-pink-400/10",
    text: "text-pink-300",
  },
} as const;

function ProductThumb({
  image,
  name,
  className = "",
}: {
  image: string;
  name: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={name}
      className={`h-10 w-10 shrink-0 rounded-md border border-white/10 bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url("${image}")` }}
    />
  );
}

function PanelHeader({
  action,
  icon: Icon,
  title,
}: {
  action?: React.ReactNode;
  icon?: typeof AlertTriangle;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-lime-300" />}
        <h2 className={PANEL_TITLE}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const { customers, products, sales } = useStore();

  const dashboardData = useMemo(() => {
    const lowStockProducts = products
      .filter((product) => product.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    const productRevenue = new Map<
      string,
      { productId: string; name: string; revenue: number; units: number }
    >();

    for (const sale of sales) {
      for (const item of sale.items) {
        const current = productRevenue.get(item.productId) ?? {
          productId: item.productId,
          name: item.productName,
          revenue: 0,
          units: 0,
        };
        current.revenue += item.price * item.quantity;
        current.units += item.quantity;
        productRevenue.set(item.productId, current);
      }
    }

    return {
      lowStockProducts,
      outOfStockCount: products.filter((product) => product.stock === 0).length,
      revenue: sales.reduce((total, sale) => total + sale.total, 0),
      topProducts: [...productRevenue.values()]
        .sort((a, b) => b.units - a.units)
        .slice(0, 5),
    };
  }, [products, sales]);

  const stats = [
    {
      accent: "lime" as const,
      icon: CircleDollarSign,
      label: "Total Sales",
      note: "Live sales snapshot",
      value: `$${dashboardData.revenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
    {
      accent: "violet" as const,
      icon: ShoppingCart,
      label: "Orders",
      note: "Transactions recorded",
      value: sales.length.toString(),
    },
    {
      accent: "amber" as const,
      icon: Users,
      label: "Customers",
      note: "Rewards-ready contacts",
      value: customers.length.toString(),
    },
    {
      accent: "pink" as const,
      icon: AlertTriangle,
      label: "Low Stock Items",
      note: `${dashboardData.outOfStockCount} out of stock`,
      value: dashboardData.lowStockProducts.length.toString(),
    },
  ];

  const chartData = REVENUE_DATA.slice(-7);
  const chartMax = Math.max(...chartData.map((day) => day.revenue));
  const chartPoints = chartData
    .map((day, index) => {
      const x = 5 + index * 15;
      const y = 92 - (day.revenue / chartMax) * 76;
      return `${x},${y}`;
    })
    .join(" ");
  const chartArea = `5,96 ${chartPoints} 95,96`;

  return (
    <div className="relative min-h-full overflow-hidden bg-[#080a09]">
      <GridScanOverlay className="opacity-70" gridSize={80} scanSpeed={18} />
      <div className="relative z-10 mx-auto max-w-[1680px] space-y-4 p-4 md:p-6">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-lime-300">
              Store command center
            </p>
            <h1 className="mt-1 text-2xl font-black uppercase text-white md:text-3xl">
              Wassup, Manager
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Here&apos;s what&apos;s happening across the shop.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              className="relative min-w-0 flex-1 xl:w-72 xl:flex-none"
              htmlFor="dashboard-search"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <span className="sr-only">Search dashboard</span>
              <Input
                id="dashboard-search"
                className="h-10 rounded-md border-white/10 bg-black/30 pl-9 text-sm text-white placeholder:text-zinc-600"
                placeholder="Search anything..."
              />
            </label>
            <Button
              aria-label="Notifications"
              size="icon"
              variant="outline"
              className="relative border-white/10 bg-black/30 text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-bold text-white">
                3
              </span>
            </Button>
            <Button
              aria-label="Calendar"
              size="icon"
              variant="outline"
              className="border-white/10 bg-black/30 text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map((stat) => {
            const style = METRIC_STYLES[stat.accent];
            return (
              <GlowContainer
                key={stat.label}
                accent={stat.accent}
                className={`min-h-36 p-4 ${style.border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={PANEL_TITLE}>{stat.label}</p>
                    <p className="mt-4 truncate text-2xl font-black text-white md:text-3xl">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-md p-2.5 ${style.iconBg}`}>
                    <stat.icon className={`h-6 w-6 ${style.icon}`} />
                  </div>
                </div>
                <div className="absolute inset-x-4 bottom-4 border-t border-white/10 pt-2">
                  <p className={`text-xs ${style.text}`}>{stat.note}</p>
                </div>
              </GlowContainer>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr_0.9fr]">
          <GlowContainer className="min-h-[350px]" hover={false}>
            <PanelHeader
              title="Sales Overview"
              action={
                <Badge
                  variant="outline"
                  className="border-lime-400/25 bg-lime-400/10 text-lime-200"
                >
                  This week
                </Badge>
              }
            />
            <div className="px-4 py-5">
              <svg
                aria-label="Sales overview for the last seven days"
                className="h-[245px] w-full overflow-visible"
                preserveAspectRatio="none"
                role="img"
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient id="salesArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity="0.28" />
                    <stop offset="95%" stopColor="#a3e635" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[20, 40, 60, 80].map((line) => (
                  <line
                    key={line}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.35"
                    x1="0"
                    x2="100"
                    y1={line}
                    y2={line}
                  />
                ))}
                <polygon fill="url(#salesArea)" points={chartArea} />
                <polyline
                  fill="none"
                  points={chartPoints}
                  stroke="#a3e635"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                {chartData.map((day, index) => {
                  const x = 5 + index * 15;
                  const y = 92 - (day.revenue / chartMax) * 76;
                  return (
                    <circle
                      key={day.date}
                      cx={x}
                      cy={y}
                      fill="#111512"
                      r="1.35"
                      stroke="#a3e635"
                      strokeWidth="0.7"
                    />
                  );
                })}
              </svg>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase text-zinc-500">
                {chartData.map((day) => (
                  <span key={day.date}>{day.date}</span>
                ))}
              </div>
            </div>
          </GlowContainer>

          <GlowContainer
            accent="violet"
            className="min-h-[350px]"
            hover={false}
          >
            <PanelHeader
              title="Top Selling Products"
              action={
                <Link
                  href="/employee/inventory"
                  className="text-xs font-semibold text-violet-300 transition-colors hover:text-violet-200"
                >
                  View all
                </Link>
              }
            />
            <div className="space-y-1 p-3">
              {dashboardData.topProducts.map((item, index) => {
                const product = products.find(
                  (candidate) => candidate.id === item.productId,
                );
                return (
                  <div
                    key={item.productId}
                    className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-300 text-[10px] font-black text-black">
                      {index + 1}
                    </span>
                    {product && (
                      <ProductThumb image={product.image} name={product.name} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-100">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.units} units sold
                      </p>
                    </div>
                    <p className="text-right text-sm font-bold text-lime-300">
                      ${item.revenue.toFixed(0)}
                    </p>
                  </div>
                );
              })}
            </div>
          </GlowContainer>

          <GlowContainer accent="pink" className="min-h-[350px]" hover={false}>
            <PanelHeader icon={AlertTriangle} title="Low Stock Alerts" />
            <div className="space-y-1 p-3">
              {dashboardData.lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href="/employee/inventory"
                  className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-white/[0.04]"
                >
                  <ProductThumb image={product.image} name={product.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-100">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {CATEGORY_LABELS[product.category]}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      product.stock === 0
                        ? "border-pink-400/25 bg-pink-400/10 text-pink-300"
                        : "border-amber-400/25 bg-amber-400/10 text-amber-300"
                    }
                  >
                    {product.stock === 0 ? "Out" : `${product.stock} left`}
                  </Badge>
                </Link>
              ))}
              <Button
                asChild
                className="mt-3 w-full bg-pink-500 text-white hover:bg-pink-400"
                size="sm"
              >
                <Link href="/employee/inventory">
                  View inventory
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </GlowContainer>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.55fr]">
          <GlowContainer accent="amber" className="p-4" hover={false}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={PANEL_TITLE}>POS Quick Start</h2>
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                {
                  href: "/employee/pos",
                  icon: ShoppingCart,
                  label: "New sale",
                  style: "bg-lime-300 text-black hover:bg-lime-200",
                },
                {
                  href: "/employee/scanner",
                  icon: ScanBarcode,
                  label: "Scan item",
                  style: "bg-violet-500 text-white hover:bg-violet-400",
                },
                {
                  href: "/employee/inventory",
                  icon: Package,
                  label: "Inventory",
                  style: "bg-amber-300 text-black hover:bg-amber-200",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex min-h-28 flex-col justify-between rounded-md p-3 text-xs font-black uppercase transition-all duration-300 hover:-translate-y-1 ${item.style}`}
                >
                  <item.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </GlowContainer>

          <GlowContainer
            accent="lime"
            className="group min-h-44 border-lime-400/20 p-5"
            hover={false}
          >
            <div className="employee-shimmer pointer-events-none absolute inset-y-0 left-0 w-20 skew-x-[-18deg] bg-white/[0.04]" />
            <div className="relative flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="rounded-md border border-lime-300/30 bg-lime-300/10 p-3 text-lime-300">
                  <Crown className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-pink-300">
                    Customer retention
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white">
                    Loyalty Rewards
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-zinc-400">
                    Keep your regulars coming back with rewards, customer notes,
                    and a smoother checkout.
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="shrink-0 bg-lime-300 text-black hover:bg-lime-200"
              >
                <Link href="/employee/customers">
                  <Gift className="h-4 w-4" />
                  Manage rewards
                </Link>
              </Button>
            </div>
          </GlowContainer>
        </section>

        <GlowContainer accent="cyan" hover={false}>
          <PanelHeader
            icon={Store}
            title="Recent Transactions"
            action={
              <Link
                href="/employee/sales"
                className="flex items-center gap-1 text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Sales history
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            {sales.slice(0, 4).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between gap-3 border-b border-white/10 p-4 last:border-b-0 md:border-r xl:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {sale.customerName || "Walk-in customer"}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                    {sale.id} · {sale.paymentMethod}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-black text-cyan-300">
                  ${sale.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </GlowContainer>
      </div>
    </div>
  );
}
