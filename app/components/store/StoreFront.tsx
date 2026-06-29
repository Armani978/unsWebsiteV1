"use client";

import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Package,
  Search,
  ShoppingBag,
  Star,
  Store,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../../context/StoreContext";
import type { Category, Product } from "../../data/types";
import { CATEGORY_LABELS } from "../../data/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const ALL_CATEGORIES = [
  "all",
  "vapes",
  "glass",
  "papers",
  "lighters",
  "accessories",
  "hookah",
  "cbd",
  "thca",
] as const;

const categoryDescriptions: Record<Category, string> = {
  accessories: "Tools, trays, grinders, cleaners, and small upgrades.",
  cbd: "CBD and hemp essentials for a calmer shelf.",
  glass: "Pipes, bowls, rigs, bubblers, and display-ready glass.",
  hookah: "Hookah pieces, hoses, bowls, and session supplies.",
  lighters: "Everyday sparks, torches, and counter staples.",
  papers: "Papers, cones, wraps, filters, and roll-your-own basics.",
  thca: "THCA and hemp products with pickup availability.",
  vapes: "Disposables, devices, pods, coils, and vape essentials.",
};

function formatCategory(category: (typeof ALL_CATEGORIES)[number]) {
  return category === "all" ? "All goods" : CATEGORY_LABELS[category];
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <Badge className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50">
        Sold out
      </Badge>
    );
  }

  if (stock <= 5) {
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
        Low stock
      </Badge>
    );
  }

  return (
    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
      In stock
    </Badge>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="sr-only">{rating.toFixed(1)} star rating</span>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-3.5 w-3.5 ${
            value <= Math.round(rating)
              ? "fill-[#b89b5e] text-[#b89b5e]"
              : "text-stone-300"
          }`}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  tone = "light",
}: {
  product: Product;
  tone?: "light" | "dark";
}) {
  const { addToCart } = useStore();
  const outOfStock = product.stock === 0;
  const isDark = tone === "dark";

  return (
    <article
      className={`group flex min-h-full flex-col overflow-hidden rounded-lg border transition duration-300 hover:-translate-y-1 ${
        isDark
          ? "border-white/10 bg-white/[0.04] text-white hover:border-[#d7bd7a]/50"
          : "border-stone-200 bg-white text-stone-950 shadow-sm hover:border-[#b89b5e]/50 hover:shadow-xl"
      }`}
    >
      <Link
        href={`/store/product/${product.id}`}
        className={`relative block aspect-[4/3] overflow-hidden ${
          isDark ? "bg-[#111111]" : "bg-[#f1eee7]"
        }`}
      >
        <Image
          fill
          unoptimized
          src={product.image}
          alt={product.name}
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 92vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.featured && (
            <span className="rounded bg-[#111111] px-2 py-1 text-[10px] font-black uppercase leading-none text-white">
              Featured
            </span>
          )}
          <StockBadge stock={product.stock} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p
            className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
              isDark ? "text-stone-500" : "text-stone-400"
            }`}
          >
            {product.sku}
          </p>
          <StarRating rating={product.rating} />
        </div>
        <Link
          href={`/store/product/${product.id}`}
          className={`line-clamp-2 min-h-[42px] text-base font-black uppercase leading-[1.08] transition-colors ${
            isDark
              ? "text-white group-hover:text-[#ead08a]"
              : "text-stone-950 group-hover:text-[#7d6228]"
          }`}
        >
          {product.name}
        </Link>
        <p
          className={`mt-2 text-xs font-semibold uppercase ${
            isDark ? "text-stone-500" : "text-stone-500"
          }`}
        >
          {CATEGORY_LABELS[product.category]}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                isDark ? "text-stone-500" : "text-stone-400"
              }`}
            >
              Price
            </p>
            <p className={isDark ? "text-xl font-black" : "text-xl font-black"}>
              ${product.price.toFixed(2)}
            </p>
          </div>
          <Button
            size="sm"
            disabled={outOfStock}
            onClick={() => addToCart(product)}
            className={
              isDark
                ? "h-9 rounded-md bg-[#d7bd7a] px-3 text-xs font-black uppercase text-black hover:bg-[#ead08a] disabled:border disabled:border-white/10 disabled:bg-transparent disabled:text-stone-500"
                : "h-9 rounded-md bg-[#111111] px-3 text-xs font-black uppercase text-white hover:bg-[#3a3124] disabled:border disabled:border-stone-200 disabled:bg-transparent disabled:text-stone-400"
            }
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {outOfStock ? "Sold out" : "Add"}
          </Button>
        </div>
      </div>
    </article>
  );
}

function FeatureNote({
  icon: Icon,
  label,
}: {
  icon: typeof BadgeCheck;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 border-stone-300 border-l pl-4">
      <Icon className="h-4 w-4 text-[#8b733d]" />
      <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-600">
        {label}
      </span>
    </div>
  );
}

export default function StoreFront() {
  const { products, addToCart } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<(typeof ALL_CATEGORIES)[number]>("all");

  const featured = useMemo(
    () => products.filter((product) => product.featured).slice(0, 5),
    [products],
  );
  const thcaProducts = useMemo(
    () => products.filter((product) => product.category === "thca").slice(0, 8),
    [products],
  );
  const heroProduct = featured[0] ?? products[0];

  useEffect(() => {
    const syncCategoryFromHash = () => {
      const hashCategory = window.location.hash.replace("#category-", "");
      if (
        ALL_CATEGORIES.includes(hashCategory as (typeof ALL_CATEGORIES)[number])
      ) {
        setCategory(hashCategory as (typeof ALL_CATEGORIES)[number]);
        document
          .getElementById("products")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    syncCategoryFromHash();
    window.addEventListener("hashchange", syncCategoryFromHash);
    return () => window.removeEventListener("hashchange", syncCategoryFromHash);
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchCat = category === "all" || product.category === category;
      const query = search.toLowerCase();
      const matchSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        CATEGORY_LABELS[product.category].toLowerCase().includes(query);
      return matchCat && matchSearch;
    });
  }, [products, search, category]);

  const categoryCounts = useMemo(() => {
    return products.reduce(
      (counts, product) => {
        counts[product.category] = (counts[product.category] ?? 0) + 1;
        return counts;
      },
      {} as Record<Category, number>,
    );
  }, [products]);

  return (
    <div className="bg-[#fbfaf7] text-stone-950">
      <section className="relative overflow-hidden border-stone-200 border-b bg-[#fbfaf7]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(184,155,94,0.18),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:pb-16 lg:pt-14">
          <div>
            <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-normal text-stone-950 sm:text-7xl lg:text-8xl">
              Curated smoke shop pickup.
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-stone-600 sm:text-lg">
              Premium glass, vapes, papers, lighters, hookah, CBD, and THCA
              goods organized for fast local pickup in Manchester.
            </p>

            <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <label className="relative flex-1" htmlFor="store-search">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <span className="sr-only">Search storefront products</span>
                <input
                  id="store-search"
                  type="text"
                  placeholder="Search vapes, glass, THCA, papers..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-12 w-full rounded-lg border border-stone-300 bg-white pl-11 pr-4 text-sm font-semibold text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#b89b5e] focus:ring-4 focus:ring-[#b89b5e]/15"
                />
              </label>
              <Button
                asChild
                size="lg"
                className="h-12 rounded-lg bg-[#111111] px-5 text-sm font-black uppercase text-white hover:bg-[#3a3124]"
              >
                <a href="#products">
                  Shop goods
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              <FeatureNote
                icon={Package}
                label={`${products.length} live products`}
              />
              <FeatureNote icon={Clock3} label="Open 10 AM-10 PM" />
              <FeatureNote icon={Truck} label="Same-day pickup" />
            </div>
          </div>

          {heroProduct && (
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] border border-[#b89b5e]/30" />
              <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-white p-4 shadow-2xl shadow-stone-900/10">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[#eee8dc]">
                  <Image
                    fill
                    unoptimized
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    sizes="(min-width: 1024px) 520px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/78 via-black/25 to-transparent p-5 text-white">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded bg-[#d7bd7a] px-2 py-1 text-[10px] font-black uppercase leading-none text-black">
                        Featured
                      </span>
                      <StockBadge stock={heroProduct.stock} />
                    </div>
                    <h2 className="max-w-md text-3xl font-black uppercase leading-none">
                      {heroProduct.name}
                    </h2>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-3xl font-black text-[#ead08a]">
                        ${heroProduct.price.toFixed(2)}
                      </p>
                      <Button
                        onClick={() => addToCart(heroProduct)}
                        className="rounded-md bg-white px-4 text-xs font-black uppercase text-black hover:bg-[#ead08a]"
                      >
                        Add to cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-stone-200 border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">
            {ALL_CATEGORIES.map((item) => {
              const active = item === category;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setCategory(item);
                    document
                      .getElementById("products")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`min-h-20 rounded-lg border px-3 py-3 text-left transition ${
                    active
                      ? "border-[#b89b5e] bg-[#111111] text-white shadow-lg"
                      : "border-stone-200 bg-[#fbfaf7] text-stone-950 hover:border-[#b89b5e]/60"
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-[0.14em] opacity-60">
                    {item === "all"
                      ? products.length
                      : (categoryCounts[item] ?? 0)}{" "}
                    items
                  </span>
                  <span className="mt-2 block text-xs font-black uppercase leading-tight">
                    {formatCategory(item)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {!search && category === "all" && (
          <>
            <section className="mb-14">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-3xl font-black uppercase leading-none text-stone-950 sm:text-4xl">
                    Featured shelf
                  </h2>
                  <p className="mt-2 text-sm font-medium text-stone-600">
                    The fast movers, kept up front.
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-fit border-stone-300 bg-white text-xs font-black uppercase text-stone-950 hover:bg-[#f1eee7]"
                >
                  <a href="#products">
                    View all
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {featured.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            <section className="mb-14 overflow-hidden rounded-lg bg-[#111111] text-white shadow-2xl shadow-stone-900/15">
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col justify-between border-white/10 border-b p-6 lg:border-r lg:border-b-0">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#d7bd7a]">
                      Storefront focus
                    </p>
                    <h2 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">
                      THCA & Hemp shelf
                    </h2>
                    <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-stone-400">
                      Flower, pre-rolls, gummies, carts, hemp wraps, and
                      concentrates grouped for easier pickup browsing.
                    </p>
                  </div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    {[
                      "Availability checked daily",
                      "Age-restricted pickup",
                      "Ask staff about local rules",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs font-black uppercase tracking-[0.12em] text-stone-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
                  {thcaProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      tone="dark"
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <section id="products">
          <div className="mb-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <h2 className="text-3xl font-black uppercase leading-none text-stone-950 sm:text-4xl">
                {formatCategory(category)}
              </h2>
              <p className="mt-2 text-sm font-medium text-stone-600">
                {category === "all"
                  ? "Browse every product currently in the store catalog."
                  : categoryDescriptions[category as Category]}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-black uppercase text-stone-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {search ? ` for "${search}"` : ""}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white text-stone-500">
              <Package className="mb-3 h-12 w-12 text-stone-300" />
              <p className="font-black uppercase">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-14 grid gap-4 rounded-lg border border-stone-200 bg-white p-5 sm:grid-cols-3">
          {[
            {
              icon: Store,
              title: "Manchester pickup",
              body: "Shop online, confirm what is in stock, and pick up at the counter.",
            },
            {
              icon: BadgeCheck,
              title: "Curated categories",
              body: "Vapes, glass, papers, hookah, CBD, and THCA kept organized.",
            },
            {
              icon: ShoppingBag,
              title: "Built for repeat visits",
              body: "Favorites, pickup history, and customer accounts stay separate from staff tools.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="border-stone-200 border-l pl-4">
              <Icon className="h-5 w-5 text-[#8b733d]" />
              <h3 className="mt-3 text-sm font-black uppercase text-stone-950">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
