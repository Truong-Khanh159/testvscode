"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

type CartItem = {
  slug: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (slug: string) => void;
  updateItem: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "flower-shop-cart";
const listeners = new Set<() => void>();
const emptyCart: CartItem[] = [];
let cachedRawCart: string | null = null;
let cachedCart: CartItem[] = emptyCart;

function getServerSnapshot(): CartItem[] {
  return emptyCart;
}

function getCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") {
    return emptyCart;
  }

  try {
    const savedCart = window.localStorage.getItem(storageKey);
    if (savedCart === cachedRawCart) {
      return cachedCart;
    }

    cachedRawCart = savedCart;
    cachedCart = savedCart ? JSON.parse(savedCart) : emptyCart;
    return cachedCart;
  } catch {
    return emptyCart;
  }
}

function subscribeToCart(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function saveCart(items: CartItem[]) {
  cachedCart = items;
  cachedRawCart = JSON.stringify(items);
  window.localStorage.setItem(storageKey, cachedRawCart);
  listeners.forEach((listener) => listener());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerSnapshot);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      totalItems,
      addItem: (slug) => {
        const existingItem = items.find((item) => item.slug === slug);
        const nextItems = existingItem
          ? items.map((item) => (item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item))
          : [...items, { slug, quantity: 1 }];

        saveCart(nextItems);
      },
      updateItem: (slug, quantity) => {
        saveCart(
          items
            .map((item) => (item.slug === slug ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      removeItem: (slug) => {
        saveCart(items.filter((item) => item.slug !== slug));
      },
      clearCart: () => saveCart([])
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
