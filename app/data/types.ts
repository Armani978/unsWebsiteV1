export type Category =
  | "vapes"
  | "glass"
  | "papers"
  | "lighters"
  | "accessories"
  | "hookah"
  | "cbd"
  | "thca";

export const CATEGORY_LABELS: Record<Category, string> = {
  vapes: "Vapes & E-Cigs",
  glass: "Glass & Pipes",
  papers: "Papers & Wraps",
  lighters: "Lighters",
  accessories: "Accessories",
  hookah: "Hookah",
  cbd: "CBD & Hemp",
  thca: "THCA & Hemp",
};

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  price: number;
  costPrice: number;
  stock: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  featured?: boolean;
  barcode: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card";
  cashGiven?: number;
  change?: number;
  timestamp: string;
  cashier: string;
  customerName?: string;
  pickupOrderId?: string;
}

export type PickupStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "arrived"
  | "completed"
  | "cancelled";

export interface PickupOrder {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card";
  status: PickupStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupWindow: string;
  notes?: string;
  createdAt: string;
  estimatedReadyAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  visitCount: number;
  lastVisit: string;
  joinDate: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}
