"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
} from "../data/mockData";
import type {
  CartItem,
  Customer,
  PickupOrder,
  PickupStatus,
  Product,
  Sale,
} from "../data/types";

interface StoreContextType {
  products: Product[];
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  cartCount: number;
  sales: Sale[];
  addSale: (sale: Omit<Sale, "id">) => void;
  customers: Customer[];
  pickupOrders: PickupOrder[];
  createPickupOrder: (
    order: Omit<PickupOrder, "id" | "status" | "createdAt">,
  ) => PickupOrder;
  updatePickupStatus: (orderId: string, status: PickupStatus) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);
const PICKUP_STORAGE_KEY = "uns-pickup-orders";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [pickupOrders, setPickupOrders] = useState<PickupOrder[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PICKUP_STORAGE_KEY);
      if (saved) {
        setPickupOrders(JSON.parse(saved) as PickupOrder[]);
      }
    } catch {
      setPickupOrders([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      PICKUP_STORAGE_KEY,
      JSON.stringify(pickupOrders),
    );
  }, [pickupOrders]);

  const updateProduct = (product: Product) =>
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));

  const addProduct = (product: Omit<Product, "id">) =>
    setProducts((prev) => [...prev, { ...product, id: `p${Date.now()}` }]);

  const addToCart = (product: Product, qty = 1) =>
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      }
      return [...prev, { product, quantity: qty }];
    });

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== productId));

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: qty } : i,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const addSale = (saleData: Omit<Sale, "id">) => {
    const sale: Sale = { ...saleData, id: `TXN-${Date.now()}` };
    setSales((prev) => [sale, ...prev]);
    saleData.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === item.productId
            ? { ...p, stock: Math.max(0, p.stock - item.quantity) }
            : p,
        ),
      );
    });
  };

  const createPickupOrder: StoreContextType["createPickupOrder"] = (
    orderData,
  ) => {
    const order: PickupOrder = {
      ...orderData,
      id: `PU-${Date.now().toString().slice(-6)}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setPickupOrders((prev) => [order, ...prev]);
    return order;
  };

  const updatePickupStatus = (orderId: string, status: PickupStatus) => {
    setPickupOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
  };

  const cartSubtotal = cart.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );
  const cartTax = cartSubtotal * 0.08875;
  const cartTotal = cartSubtotal + cartTax;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        updateProduct,
        addProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        cartCount,
        sales,
        addSale,
        customers,
        pickupOrders,
        createPickupOrder,
        updatePickupStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
