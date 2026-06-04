"use client";

import {
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
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
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
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

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/store")}
        >
          Back to Shop
        </Button>
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const stockStatus =
    product.stock === 0
      ? {
          label: "Out of Stock",
          className: "bg-destructive/10 text-destructive border-destructive/20",
        }
      : product.stock <= 5
        ? {
            label: `Low Stock — Only ${product.stock} left`,
            className: "bg-amber-50 text-amber-800 border-amber-200",
          }
        : {
            label: `In Stock (${product.stock} available)`,
            className: "bg-green-50 text-green-800 border-green-200",
          };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/store" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link
          href={`/store?cat=${product.category}`}
          className="hover:text-foreground transition-colors capitalize"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="rounded-xl overflow-hidden border border-border bg-muted/10">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 lg:h-[480px] object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit mb-3">
            {CATEGORY_LABELS[product.category]}
          </Badge>
          <h1 className="mb-2">{product.name}</h1>
          <p className="text-sm text-muted-foreground mb-1">
            SKU: {product.sku}
          </p>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} size="lg" />
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mb-4">
            <span className="text-3xl font-semibold">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium mb-6 w-fit ${stockStatus.className}`}
          >
            <Package className="w-4 h-4" />
            {stockStatus.label}
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            {product.description}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
              {added
                ? "Added to Cart!"
                : product.stock === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product, qty);
                router.push("/store/checkout");
              }}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Reviews */}
      <Tabs defaultValue="reviews" className="mb-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({product.reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground mb-0.5">SKU</p>
              <p className="font-medium">{product.sku}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground mb-0.5">Category</p>
              <p className="font-medium">{CATEGORY_LABELS[product.category]}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground mb-0.5">Barcode</p>
              <p className="font-medium font-mono text-xs">{product.barcode}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground mb-0.5">Stock</p>
              <p className="font-medium">{product.stock} units</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {product.reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                        {review.author.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">
                        {review.author}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {review.date}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className="text-sm text-muted-foreground mt-2">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-5">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/store/product/${p.id}`}
                className="group border border-border rounded-xl overflow-hidden hover:shadow-md transition-all"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2 leading-snug">
                    {p.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${p.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
