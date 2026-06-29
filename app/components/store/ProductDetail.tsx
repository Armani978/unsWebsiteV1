"use client";

import {
  BadgeCheck,
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { CATEGORY_LABELS } from "../../data/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const sz = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      <span className="sr-only">{rating.toFixed(1)} star rating</span>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`${sz} ${
            value <= Math.round(rating)
              ? "fill-[#b89b5e] text-[#b89b5e]"
              : "text-stone-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart } = useStore();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <div className="bg-[#fbfaf7] px-4 py-24 text-center text-stone-950">
        <p className="font-black uppercase">Product not found.</p>
        <Button
          variant="outline"
          className="mt-4 border-stone-300 bg-white text-stone-950 hover:bg-[#f1eee7]"
          onClick={() => router.push("/store")}
        >
          Back to shop
        </Button>
      </div>
    );
  }

  const related = products
    .filter(
      (item) => item.category === product.category && item.id !== product.id,
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const stockStatus =
    product.stock === 0
      ? {
          label: "Out of stock",
          className: "border-red-200 bg-red-50 text-red-700",
        }
      : product.stock <= 5
        ? {
            label: `Low stock, only ${product.stock} left`,
            className: "border-amber-200 bg-amber-50 text-amber-800",
          }
        : {
            label: `In stock, ${product.stock} available`,
            className: "border-emerald-200 bg-emerald-50 text-emerald-800",
          };

  return (
    <div className="bg-[#fbfaf7] text-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <nav className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-stone-500">
          <Link
            href="/store"
            className="transition-colors hover:text-stone-950"
          >
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <a
            href={`/store#category-${product.category}`}
            className="capitalize transition-colors hover:text-stone-950"
          >
            {CATEGORY_LABELS[product.category]}
          </a>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 text-stone-950">{product.name}</span>
        </nav>

        <div className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-12">
          <div className="relative lg:self-start">
            <div className="absolute -inset-4 rounded-[2rem] border border-[#b89b5e]/25" />
            <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-white p-4 shadow-2xl shadow-stone-900/10">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[#eee8dc] lg:aspect-[5/4]">
                <Image
                  fill
                  unoptimized
                  src={product.image}
                  alt={product.name}
                  sizes="(min-width: 1024px) 54vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <Badge className="mb-4 w-fit border-[#d7bd7a]/50 bg-[#f7efd8] text-[#6f5622] hover:bg-[#f7efd8]">
              {CATEGORY_LABELS[product.category]}
            </Badge>
            <h1 className="text-4xl font-black uppercase leading-none text-stone-950 sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-stone-400">
              SKU: {product.sku}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StarRating rating={product.rating} size="lg" />
              <span className="text-sm font-semibold text-stone-500">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="mt-6">
              <span className="text-4xl font-black text-stone-950">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div
              className={`mt-5 inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold ${stockStatus.className}`}
            >
              <Package className="h-4 w-4" />
              {stockStatus.label}
            </div>

            <p className="mt-6 text-sm leading-7 text-stone-600">
              {product.description}
            </p>

            {product.stock > 0 && (
              <div className="mt-7 flex items-center gap-3">
                <span className="text-sm font-black uppercase text-stone-700">
                  Quantity
                </span>
                <div className="flex items-center overflow-hidden rounded-lg border border-stone-300 bg-[#fbfaf7]">
                  <button
                    type="button"
                    onClick={() =>
                      setQty((current) => Math.max(1, current - 1))
                    }
                    className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-[#f1eee7]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-black">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQty((current) => Math.min(product.stock, current + 1))
                    }
                    className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-[#f1eee7]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1 rounded-md bg-[#111111] font-black uppercase text-white hover:bg-[#3a3124]"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4" />
                {added
                  ? "Added to cart"
                  : product.stock === 0
                    ? "Out of stock"
                    : "Add to cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-stone-300 bg-white font-black uppercase text-stone-950 hover:bg-[#f1eee7]"
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart(product, qty);
                  router.push("/store/checkout");
                }}
              >
                Buy now
              </Button>
            </div>

            <div className="mt-6 grid gap-3 border-stone-200 border-t pt-5 sm:grid-cols-2">
              {["Same-day pickup", "Age-restricted items checked in store"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <BadgeCheck className="h-4 w-4 text-[#8b733d]" />
                    <span className="font-semibold text-stone-600">{item}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="mb-14">
          <TabsList className="bg-white">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.reviewCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["SKU", product.sku],
                ["Category", CATEGORY_LABELS[product.category]],
                ["Barcode", product.barcode],
                ["Stock", `${product.stock} units`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-[#fbfaf7] p-3">
                  <p className="mb-1 text-xs font-black uppercase text-stone-400">
                    {label}
                  </p>
                  <p className="font-semibold text-stone-950">{value}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            {product.reviews.length === 0 ? (
              <p className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-500">
                No reviews yet.
              </p>
            ) : (
              <div className="grid gap-4">
                {product.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-lg border border-stone-200 bg-white p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-xs font-black uppercase text-white">
                          {review.author.charAt(0)}
                        </div>
                        <span className="text-sm font-black">
                          {review.author}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500">
                        {review.date}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {related.length > 0 && (
          <section>
            <h2 className="mb-5 text-3xl font-black uppercase leading-none text-stone-950">
              Related goods
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/store/product/${item.id}`}
                  className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#b89b5e]/50 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] bg-[#eee8dc]">
                    <Image
                      fill
                      unoptimized
                      src={item.image}
                      alt={item.name}
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-black uppercase leading-snug text-stone-950">
                      {item.name}
                    </p>
                    <p className="mt-2 text-sm font-black text-[#7d6228]">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
