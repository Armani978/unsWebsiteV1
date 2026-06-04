"use client";

import {
  AlertTriangle,
  Edit2,
  Package,
  Plus,
  Save,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "../../context/StoreContext";
import type { Category, Product } from "../../data/types";
import { CATEGORY_LABELS } from "../../data/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const EMPTY: Omit<Product, "id" | "reviews"> = {
  name: "",
  sku: "",
  category: "vapes",
  price: 0,
  costPrice: 0,
  stock: 0,
  description: "",
  image: "",
  rating: 4.5,
  reviewCount: 0,
  barcode: "",
};

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10">
        Out of Stock
      </Badge>
    );
  if (stock <= 5)
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
        Low: {stock}
      </Badge>
    );
  return <Badge variant="secondary">{stock}</Badge>;
}

export default function InventoryManagement() {
  const { products, updateProduct, addProduct } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "price">("name");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<Product, "id" | "reviews">>(EMPTY);
  const [inlineStock, setInlineStock] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products
      .filter((p) => {
        const matchCat = category === "all" || p.category === category;
        const matchSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q);
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "stock") return a.stock - b.stock;
        if (sortBy === "price") return a.price - b.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, search, category, sortBy]);

  const lowStock = products.filter((p) => p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setIsNew(false);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      description: product.description,
      image: product.image,
      rating: product.rating,
      reviewCount: product.reviewCount,
      barcode: product.barcode,
    });
  };

  const openNew = () => {
    setEditProduct(null);
    setIsNew(true);
    setForm({ ...EMPTY, sku: `NEW-${Date.now().toString().slice(-4)}` });
  };

  const saveProduct = () => {
    if (isNew) {
      addProduct({ ...form, reviews: [] });
    } else if (editProduct) {
      updateProduct({ ...editProduct, ...form });
    }
    setEditProduct(null);
    setIsNew(false);
  };

  const saveInlineStock = (product: Product) => {
    const newStock = parseInt(inlineStock[product.id] ?? "", 10);
    if (!Number.isNaN(newStock) && newStock >= 0) {
      updateProduct({ ...product, stock: newStock });
    }
    setInlineStock((prev) => {
      const n = { ...prev };
      delete n[product.id];
      return n;
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1>Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} products · $
            {totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
            value
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Products",
            value: products.length,
            icon: Package,
            color: "",
          },
          {
            label: "Low Stock",
            value: lowStock,
            icon: AlertTriangle,
            color: "text-amber-600",
          },
          {
            label: "Out of Stock",
            value: outOfStock,
            icon: AlertTriangle,
            color: "text-destructive",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-border rounded-xl p-4 bg-card"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-semibold mt-0.5 ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products, SKU, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as "name" | "stock" | "price")}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">
                Product
              </th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">
                SKU
              </th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">
                Category
              </th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">
                Stock
              </th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">
                Cost
              </th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">
                Price
              </th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((product) => (
              <tr
                key={product.id}
                className={`hover:bg-muted/20 transition-colors ${product.stock === 0 ? "bg-destructive/5" : product.stock <= 5 ? "bg-amber-50/50" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-8 h-8 rounded-md object-cover border border-border shrink-0 hidden sm:block"
                    />
                    <span className="font-medium line-clamp-1">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">
                  {product.sku}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[product.category]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {inlineStock[product.id] !== undefined ? (
                    <div className="flex items-center justify-end gap-1">
                      <Input
                        type="number"
                        value={inlineStock[product.id]}
                        onChange={(e) =>
                          setInlineStock((prev) => ({
                            ...prev,
                            [product.id]: e.target.value,
                          }))
                        }
                        className="w-16 h-7 text-right text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineStock(product);
                          if (e.key === "Escape")
                            setInlineStock((prev) => {
                              const n = { ...prev };
                              delete n[product.id];
                              return n;
                            });
                        }}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6"
                        onClick={() => saveInlineStock(product)}
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setInlineStock((prev) => ({
                          ...prev,
                          [product.id]: product.stock.toString(),
                        }))
                      }
                      className="hover:underline"
                    >
                      <StockBadge stock={product.stock} />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                  ${product.costPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(product)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No products found</p>
          </div>
        )}
      </div>

      {/* Edit / Add dialog */}
      <Dialog
        open={isNew || !!editProduct}
        onOpenChange={(open) => {
          if (!open) {
            setEditProduct(null);
            setIsNew(false);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add Product" : "Edit Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Product Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                value={form.sku}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sku: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Barcode</Label>
              <Input
                value={form.barcode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, barcode: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as Category }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    stock: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Cost Price</Label>
              <Input
                type="number"
                step="0.01"
                value={form.costPrice}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    costPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Sell Price</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label>Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.value }))
                }
                className="mt-1"
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditProduct(null);
                setIsNew(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveProduct} disabled={!form.name || !form.sku}>
              {isNew ? "Add Product" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
