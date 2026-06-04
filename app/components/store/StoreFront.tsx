"use client";

import {
  ArrowRight,
  BadgeCheck,
  Package,
  Search,
  ShoppingCart,
  Star,
  Timer,
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

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <Badge className="border-red-400/30 bg-red-500/14 text-red-200 hover:bg-red-500/14">
        Sold out
      </Badge>
    );
  }

  if (stock <= 5) {
    return (
      <Badge className="border-yellow-300/30 bg-yellow-300/14 text-yellow-100 hover:bg-yellow-300/14">
        Low stock
      </Badge>
    );
  }

  return (
    <Badge className="border-yellow-300/30 bg-yellow-300/12 text-yellow-100 hover:bg-yellow-300/12">
      In stock
    </Badge>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="sr-only">{rating.toFixed(1)} star rating</span>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? "fill-yellow-300 text-yellow-300" : "text-white/18"}`}
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  featured = false,
}: {
  product: Product;
  featured?: boolean;
}) {
  const { addToCart } = useStore();
  const outOfStock = product.stock === 0;

  return (
    <article className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#121413] shadow-[0_18px_70px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1 hover:border-yellow-300/35 hover:bg-[#171917]">
      <Link
        href={`/store/product/${product.id}`}
        className={`relative block overflow-hidden bg-[#090a09] ${featured ? "h-64" : "h-56"}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(250,204,21,0.24),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.38))] opacity-80" />
        <Image
          fill
          unoptimized
          src={product.image}
          alt={product.name}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="relative z-0 object-cover opacity-[0.88] mix-blend-screen grayscale-[18%] transition duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {product.featured && (
            <span className="rounded bg-yellow-300 px-2 py-1 text-[10px] font-black uppercase leading-none text-black">
              Featured
            </span>
          )}
          <StockBadge stock={product.stock} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase text-zinc-500">
            {product.sku}
          </p>
          <StarRating rating={product.rating} />
        </div>
        <Link
          href={`/store/product/${product.id}`}
          className="line-clamp-2 min-h-[42px] text-base font-black uppercase leading-[1.08] text-zinc-50 transition-colors group-hover:text-yellow-100"
        >
          {product.name}
        </Link>
        <p className="mt-2 text-xs font-medium uppercase text-zinc-500">
          {CATEGORY_LABELS[product.category]}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[10px] uppercase text-zinc-600">Price</p>
            <p className="text-xl font-black text-white">
              ${product.price.toFixed(2)}
            </p>
          </div>
          <Button
            size="sm"
            disabled={outOfStock}
            onClick={() => addToCart(product)}
            className="h-9 rounded-md bg-yellow-300 px-3 text-xs font-black uppercase text-black hover:bg-yellow-200 disabled:border disabled:border-white/10 disabled:bg-transparent disabled:text-zinc-500"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {outOfStock ? "Sold out" : "Add"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function StoreFront() {
  const { products, addToCart } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<(typeof ALL_CATEGORIES)[number]>("all");

  const featured = useMemo(
    () => products.filter((p) => p.featured).slice(0, 4),
    [products],
  );
  const thcaProducts = useMemo(
    () => products.filter((p) => p.category === "thca").slice(0, 8),
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
    return products.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        CATEGORY_LABELS[p.category].toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, search, category]);

  return (
    <div className="bg-[var(--shop-page-bg)] text-[var(--shop-page-text)]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[var(--shop-hero-bg)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(250,204,21,0.25),transparent_28%),radial-gradient(circle_at_16%_70%,rgba(255,255,255,0.06),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.12)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[var(--shop-grid-opacity)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:pb-16 lg:pt-16">
          <div>
            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.9] text-[var(--shop-hero-text)] sm:text-7xl lg:text-8xl">
              Built for the late pickup
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-[var(--shop-hero-muted)] sm:text-lg">
              Live stock. Same-day pickup. Premium glass, vapes, papers, and
              accessories.
            </p>

            <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search products, SKUs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-lg border border-black/20 bg-black pl-11 pr-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition placeholder:text-zinc-600 focus:border-yellow-100 focus:ring-4 focus:ring-black/10"
                />
              </div>
              <Button
                asChild
                size="lg"
                className="h-12 rounded-lg bg-yellow-300 px-5 text-sm font-black uppercase text-black hover:bg-yellow-200"
              >
                <a href="#products">
                  Shop the drop
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Package, label: `${products.length} live products` },
                { icon: Timer, label: "Same-day pickup" },
                { icon: BadgeCheck, label: "Stock checked daily" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 border-l border-white/10 pl-4"
                >
                  <Icon className="h-4 w-4 text-yellow-300" />
                  <span className="text-xs font-bold uppercase text-[var(--shop-hero-muted)]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {heroProduct && (
            <div className="relative">
              <div className="absolute -inset-6 bg-yellow-300/12 blur-3xl" />
              <div className="relative overflow-hidden rounded-lg border border-white/[0.1] bg-[#111311] p-4 shadow-[0_24px_100px_rgba(0,0,0,0.55)]">
                <div className="relative h-[420px] overflow-hidden rounded-md bg-black">
                  <Image
                    fill
                    unoptimized
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    sizes="(min-width: 1024px) 520px, 100vw"
                    className="object-cover opacity-90 mix-blend-screen grayscale-[12%]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,rgba(0,0,0,0.92))]" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded bg-yellow-300 px-2 py-1 text-[10px] font-black uppercase leading-none text-black">
                        Featured
                      </span>
                      <StockBadge stock={heroProduct.stock} />
                    </div>
                    <h2 className="max-w-md text-3xl font-black uppercase leading-none text-white">
                      {heroProduct.name}
                    </h2>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-3xl font-black text-yellow-300">
                        ${heroProduct.price.toFixed(2)}
                      </p>
                      <Button
                        onClick={() => addToCart(heroProduct)}
                        className="rounded-md bg-yellow-300 px-4 text-xs font-black uppercase text-black hover:bg-yellow-200"
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

      <div className="relative border-t border-[var(--shop-page-border)] bg-[var(--shop-page-bg)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[var(--shop-grid-opacity)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
          {!search && category === "all" && (
            <>
              <section className="mb-12">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black uppercase leading-none text-[var(--shop-page-text)]">
                      Featured
                    </h2>
                    <p className="mt-2 text-sm font-medium text-[var(--shop-page-muted)]">
                      The fast movers, kept up front.
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hidden text-xs font-black uppercase text-yellow-300 hover:bg-yellow-300/10 hover:text-yellow-100 sm:inline-flex"
                  >
                    <a href="#products">
                      View all
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {featured.map((p) => (
                    <ProductCard key={p.id} product={p} featured />
                  ))}
                </div>
              </section>

              {thcaProducts.length > 0 && (
                <>
                  <section className="mb-6 overflow-hidden rounded-lg border border-black/20 bg-black text-white shadow-[0_24px_100px_rgba(0,0,0,0.26)]">
                    <div className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.22),transparent_34%),#0b0c0b] px-4 py-5 sm:px-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-yellow-300">
                            In-store exclusive
                          </p>
                          <h2 className="mt-2 text-4xl font-black uppercase leading-none text-white">
                            THCA & Hemp shelf
                          </h2>
                          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-400">
                            Flower, pre-rolls, gummies, carts, hemp wraps, and
                            concentrates with availability checked for pickup.
                          </p>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="w-fit rounded-md bg-yellow-300 text-xs font-black uppercase text-black hover:bg-yellow-200"
                        >
                          <a href="#category-thca">
                            Shop THCA & Hemp
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                      {thcaProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  </section>

                  <section className="mb-12 grid gap-4 rounded-lg border border-black/20 bg-[#101210] p-4 text-white shadow-[0_18px_70px_rgba(0,0,0,0.18)] lg:grid-cols-[0.9fr_1.1fr] lg:p-6">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-yellow-300">
                        Quick guide
                      </p>
                      <h2 className="mt-2 text-3xl font-black uppercase leading-none text-white sm:text-4xl">
                        What is THCA?
                      </h2>
                      <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-zinc-400">
                        THCA is a cannabinoid found in raw hemp flower. When
                        heat is applied, it can convert into THC, which is why
                        THCA products are usually treated as age-restricted
                        smoke shop items.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        {
                          title: "Hemp category",
                          body: "Displayed with hemp flower, pre-rolls, carts, gummies, wraps, and accessories.",
                        },
                        {
                          title: "Heat matters",
                          body: "THCA is different before heat; product use and local rules matter.",
                        },
                        {
                          title: "Ask in store",
                          body: "Availability, age requirements, and compliant options can be checked at pickup.",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                        >
                          <h3 className="text-sm font-black uppercase text-yellow-300">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">
                            {item.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </>
          )}

          <section id="products">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-3xl font-black uppercase leading-none text-[var(--shop-page-text)]">
                  {category === "all"
                    ? "Shop all"
                    : CATEGORY_LABELS[category as Category]}
                </h2>
                <p className="mt-2 text-sm font-medium text-[var(--shop-page-muted)]">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                  {search && ` for "${search}"`}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111311] px-3 py-2 text-xs font-bold uppercase text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                Live inventory
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#101210] text-zinc-500">
                <Package className="mb-3 h-12 w-12 text-white/12" />
                <p className="font-bold uppercase">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
