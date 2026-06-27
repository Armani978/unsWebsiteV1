import {
  BadgeCheck,
  Bot,
  Boxes,
  BrainCircuit,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  Gauge,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  MonitorSmartphone,
  PackageSearch,
  ReceiptText,
  ScanBarcode,
  ShieldCheck,
  Sparkles,
  Store,
  TerminalSquare,
} from "lucide-react";
import { Badge } from "../ui/badge";

type Scheme = {
  accent: string;
  bg: string;
  border: string;
  copy: string;
  dark: boolean;
  highlight: string;
  icon: typeof LayoutDashboard;
  id: string;
  layout: string;
  name: string;
  palette: string[];
  primary: string;
  risk: string;
  secondary: string;
  suitedFor: string;
  thesis: string;
  tokens: string[];
};

const schemes: Scheme[] = [
  {
    id: "01",
    name: "Quiet Ops Ledger",
    thesis:
      "A calm, table-first back office for inventory accuracy, purchasing decisions, and daily closeout.",
    suitedFor: "Inventory, settings, Clover connection, sales history",
    layout: "Dense lists, sticky filters, status rails, right-side details",
    risk: "Can feel too plain for the public storefront if used everywhere.",
    icon: ClipboardCheck,
    dark: false,
    bg: "#f4f1ea",
    border: "#d9d1c2",
    copy: "#312c24",
    primary: "#2f5f4f",
    secondary: "#8f7b52",
    accent: "#c75f32",
    highlight: "#fffaf1",
    palette: ["#f4f1ea", "#fffaf1", "#2f5f4f", "#8f7b52", "#c75f32"],
    tokens: [
      "8px cards",
      "ledger tables",
      "muted warm surfaces",
      "status-first copy",
    ],
  },
  {
    id: "02",
    name: "Neon Terminal Pro",
    thesis:
      "Your current staff terminal sharpened into a faster command UI with scan energy and strong status contrast.",
    suitedFor: "Scanner, POS, dashboard, staff navigation",
    layout: "Dark shell, command bar, neon status bands, scan-line motion",
    risk: "Needs restraint so it stays serious and does not become arcade UI.",
    icon: TerminalSquare,
    dark: true,
    bg: "#070908",
    border: "#243123",
    copy: "#f6fff0",
    primary: "#b7ff3c",
    secondary: "#8b5cf6",
    accent: "#22d3ee",
    highlight: "#11160f",
    palette: ["#070908", "#11160f", "#b7ff3c", "#8b5cf6", "#22d3ee"],
    tokens: [
      "terminal sidebar",
      "black glass",
      "lime actions",
      "monospace labels",
    ],
  },
  {
    id: "03",
    name: "Retail Glass Counter",
    thesis:
      "A point-of-sale interface that feels like a premium retail counter: quick touch targets, clean cart math, product images.",
    suitedFor: "POS, checkout, product picker, barcode flow",
    layout:
      "Split register, large product grid, persistent cart, receipt drawer",
    risk: "Less ideal for deep inventory analysis because image tiles take space.",
    icon: ReceiptText,
    dark: true,
    bg: "#0b0c0d",
    border: "#313338",
    copy: "#f7f5ef",
    primary: "#f2c94c",
    secondary: "#a7b0b8",
    accent: "#ef4444",
    highlight: "#18191b",
    palette: ["#0b0c0d", "#18191b", "#f2c94c", "#a7b0b8", "#ef4444"],
    tokens: [
      "big tap targets",
      "receipt math",
      "glass counter panels",
      "product photos",
    ],
  },
  {
    id: "04",
    name: "Command Center Max",
    thesis:
      "A manager-first screen with real-time store health, import readiness, Clover status, alerts, and next actions.",
    suitedFor: "Dashboard, operations readiness, owner overview",
    layout: "KPI spine, alert queue, split charts, action checklist",
    risk: "Too much density for phone use unless paired with a mobile companion.",
    icon: Gauge,
    dark: true,
    bg: "#101114",
    border: "#2f3440",
    copy: "#f8fafc",
    primary: "#38bdf8",
    secondary: "#f59e0b",
    accent: "#34d399",
    highlight: "#171a20",
    palette: ["#101114", "#171a20", "#38bdf8", "#f59e0b", "#34d399"],
    tokens: ["status matrix", "owner alerts", "wide data grid", "action queue"],
  },
  {
    id: "05",
    name: "Mobile Staff Companion",
    thesis:
      "A thumb-first staff UI for floor checks: scan, count, adjust, search, and verify while walking the shop.",
    suitedFor: "Mobile scanner, count sheets, receiving, quick stock edits",
    layout:
      "Bottom actions, single-column tasks, large camera/search affordance",
    risk: "Desktop dashboards need a denser sibling, not just a stretched mobile layout.",
    icon: MonitorSmartphone,
    dark: false,
    bg: "#f8faf7",
    border: "#dce4d6",
    copy: "#1f2a1f",
    primary: "#3b7c3b",
    secondary: "#111827",
    accent: "#eab308",
    highlight: "#ffffff",
    palette: ["#f8faf7", "#ffffff", "#3b7c3b", "#111827", "#eab308"],
    tokens: ["bottom rail", "one-handed scan", "large controls", "task cards"],
  },
  {
    id: "06",
    name: "Premium Boutique Storefront",
    thesis:
      "A refined customer shop that makes products feel curated and trustworthy without looking like a generic vape template.",
    suitedFor: "Public storefront, product detail, pickup ordering",
    layout:
      "Editorial product rails, clean category nav, large product photography",
    risk: "Not the right density for employee operations screens.",
    icon: Store,
    dark: false,
    bg: "#fbfaf7",
    border: "#e3ded4",
    copy: "#241f1a",
    primary: "#111111",
    secondary: "#b89b5e",
    accent: "#5c6f4f",
    highlight: "#ffffff",
    palette: ["#fbfaf7", "#ffffff", "#111111", "#b89b5e", "#5c6f4f"],
    tokens: [
      "editorial rails",
      "luxury spacing",
      "premium product tiles",
      "quiet badges",
    ],
  },
  {
    id: "07",
    name: "AI Inventory Copilot",
    thesis:
      "A 2026-ready workflow where imports, stock anomalies, reorder suggestions, and Clover sync plans feel assistant-guided.",
    suitedFor: "Inventory import, sync plans, anomaly review, future AI tools",
    layout: "Copilot side panel, explainable suggestions, approval queue",
    risk: "Needs careful trust language so staff know what is suggested versus applied.",
    icon: BrainCircuit,
    dark: true,
    bg: "#0f1020",
    border: "#2b2d55",
    copy: "#f4f2ff",
    primary: "#a78bfa",
    secondary: "#67e8f9",
    accent: "#f472b6",
    highlight: "#171833",
    palette: ["#0f1020", "#171833", "#a78bfa", "#67e8f9", "#f472b6"],
    tokens: [
      "assistant rail",
      "approval states",
      "explainable plans",
      "soft glow focus",
    ],
  },
  {
    id: "08",
    name: "Compliance Calm",
    thesis:
      "A trust-heavy interface for regulated retail: age-sensitive flows, audit trails, permissions, and safe Clover writes.",
    suitedFor: "Employee auth, settings, legal, permissions, live-write gates",
    layout: "Light surfaces, lock states, audit rows, confirmation checkpoints",
    risk: "Too conservative for customer-facing brand excitement.",
    icon: ShieldCheck,
    dark: false,
    bg: "#f6f8fb",
    border: "#d7dee8",
    copy: "#172033",
    primary: "#2457a6",
    secondary: "#64748b",
    accent: "#16a34a",
    highlight: "#ffffff",
    palette: ["#f6f8fb", "#ffffff", "#2457a6", "#64748b", "#16a34a"],
    tokens: [
      "verified badges",
      "audit trail",
      "permission gates",
      "calm blue actions",
    ],
  },
];

const surfaceMap = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: ScanBarcode, label: "Scanner" },
  { icon: Boxes, label: "Inventory" },
  { icon: CircleDollarSign, label: "POS" },
  { icon: LockKeyhole, label: "Clover writes" },
];

function MiniPreview({ scheme }: { scheme: Scheme }) {
  const rows = ["Geek Bar Pulse", "RAW papers", "Glass bowl", "Hookah hose"];

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{
        background: scheme.highlight,
        borderColor: scheme.border,
        color: scheme.copy,
      }}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-2"
        style={{ borderColor: scheme.border }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{
              background: scheme.primary,
              color: scheme.dark ? "#071009" : "#ffffff",
            }}
          >
            <scheme.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase leading-none">
              Up N Smoke
            </p>
            <p className="mt-0.5 text-[9px] opacity-60">{scheme.layout}</p>
          </div>
        </div>
        <span
          className="rounded-full px-2 py-1 text-[9px] font-bold uppercase"
          style={{ background: scheme.bg, color: scheme.primary }}
        >
          Live
        </span>
      </div>

      <div className="grid gap-2 p-3 md:grid-cols-[0.72fr_1fr]">
        <div className="space-y-2">
          {["Sales", "Stock", "Alerts"].map((label, index) => (
            <div
              key={label}
              className="rounded-md border px-2 py-2"
              style={{
                background: index === 0 ? scheme.bg : "transparent",
                borderColor: scheme.border,
              }}
            >
              <p className="text-[9px] font-bold uppercase opacity-60">
                {label}
              </p>
              <p className="mt-1 text-lg font-black leading-none">
                {index === 0 ? "$4.8k" : index === 1 ? "312" : "7"}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-md border"
          style={{ borderColor: scheme.border }}
        >
          <div
            className="flex items-center justify-between border-b px-3 py-2"
            style={{ borderColor: scheme.border }}
          >
            <span className="text-[10px] font-black uppercase">
              Inventory queue
            </span>
            <PackageSearch className="h-3.5 w-3.5 opacity-70" />
          </div>
          <div className="divide-y" style={{ borderColor: scheme.border }}>
            {rows.map((row, index) => (
              <div
                key={row}
                className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2"
                style={{ borderColor: scheme.border }}
              >
                <div>
                  <p className="truncate text-[11px] font-semibold">{row}</p>
                  <p className="text-[9px] opacity-55">
                    {index === 0 ? "Clover match" : "Needs count"}
                  </p>
                </div>
                <span
                  className="rounded px-1.5 py-1 text-[9px] font-black"
                  style={{
                    background: index === 0 ? scheme.primary : scheme.accent,
                    color: scheme.dark ? "#071009" : "#ffffff",
                  }}
                >
                  {index === 0 ? "OK" : "Fix"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaletteDots({ scheme }: { scheme: Scheme }) {
  return (
    <div className="flex items-center gap-1.5">
      {scheme.palette.map((color) => (
        <span
          key={color}
          className="h-5 w-5 rounded-full border border-black/10"
          style={{ background: color }}
          title={color}
        />
      ))}
    </div>
  );
}

export default function UiSchemes() {
  return (
    <div className="min-h-full bg-[#080a09] px-4 py-6 text-zinc-100 md:px-6">
      <div className="mx-auto max-w-[1680px] space-y-6">
        <header className="grid gap-4 border-white/10 border-b pb-6 2xl:grid-cols-[1fr_auto] 2xl:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-lime-300">
              2026 UI exploration
            </p>
            <h1 className="mt-2 max-w-5xl text-2xl font-black uppercase leading-[0.95] text-white md:text-4xl xl:text-5xl">
              Eight schemes for the store, staff portal, POS, and Clover
              workflow.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
              These are design directions, not production replacements. The
              strongest path is likely a hybrid: keep the staff terminal energy,
              add calmer inventory tables, give POS larger touch targets, and
              reserve boutique polish for the storefront.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 2xl:w-[560px]">
            {surfaceMap.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-md border border-white/10 bg-white/[0.04] p-3"
              >
                <Icon className="h-4 w-4 text-lime-300" />
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-300">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-2">
          {schemes.map((scheme) => (
            <article
              key={scheme.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-[#121411] shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
            >
              <div
                className="border-b px-4 py-4"
                style={{
                  background: scheme.bg,
                  borderColor: scheme.border,
                  color: scheme.copy,
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: scheme.primary,
                        color: scheme.dark ? "#071009" : "#ffffff",
                      }}
                    >
                      <scheme.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">
                        Scheme {scheme.id}
                      </p>
                      <h2 className="mt-1 text-xl font-black uppercase leading-none">
                        {scheme.name}
                      </h2>
                    </div>
                  </div>
                  <PaletteDots scheme={scheme} />
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-6 opacity-80">
                  {scheme.thesis}
                </p>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.82fr]">
                <MiniPreview scheme={scheme} />

                <div className="space-y-3">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-lime-300">
                      <BadgeCheck className="h-4 w-4" />
                      <p className="text-xs font-black uppercase tracking-[0.12em]">
                        Best for
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">
                      {scheme.suitedFor}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Layers3 className="h-4 w-4" />
                      <p className="text-xs font-black uppercase tracking-[0.12em]">
                        Borrow
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {scheme.tokens.map((token) => (
                        <Badge
                          key={token}
                          variant="outline"
                          className="border-white/10 bg-white/[0.03] text-zinc-300"
                        >
                          {token}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center gap-2 text-amber-300">
                      <ChartNoAxesCombined className="h-4 w-4" />
                      <p className="text-xs font-black uppercase tracking-[0.12em]">
                        Tradeoff
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {scheme.risk}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border border-lime-300/20 bg-lime-300/10 p-4 md:grid-cols-[auto_1fr] md:items-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lime-300 text-black">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase text-white">
              Recommended hybrid
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-300">
              Use Neon Terminal Pro as the staff shell, Quiet Ops Ledger for
              inventory tables, Retail Glass Counter for POS, AI Inventory
              Copilot for import/sync planning, Compliance Calm for auth and
              live-write gates, and Premium Boutique Storefront for customers.
              That gives each workflow the density and emotional tone it needs
              without forcing one visual language onto every job.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Staff shell", "POS", "Inventory", "Clover", "Storefront"].map(
                (item) => (
                  <Badge
                    key={item}
                    className="bg-lime-300 text-black hover:bg-lime-300"
                  >
                    <Sparkles className="h-3 w-3" />
                    {item}
                  </Badge>
                ),
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
