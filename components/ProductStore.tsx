"use client";

import { useCallback, useEffect, useState } from "react";
import { csrfFetch } from "@/lib/client/csrf";
import { products as defaultProducts, type Product } from "@/lib/products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    const response = await fetch("/api/products", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Không thể tải sản phẩm");
    }
    setProducts(await response.json());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      refreshProducts().catch(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshProducts]);

  return {
    products,
    isLoading,
    refreshProducts,
    addProduct: async (product: Product) => {
      const response = await csrfFetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
      if (!response.ok) {
        throw new Error("Không thể thêm sản phẩm");
      }
      await refreshProducts();
    },
    updateProduct: async (slug: string, product: Product) => {
      const response = await csrfFetch(`/api/products/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
      if (!response.ok) {
        throw new Error("Không thể cập nhật sản phẩm");
      }
      await refreshProducts();
    },
    deleteProduct: async (slug: string) => {
      const response = await csrfFetch(`/api/products/${slug}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Không thể xóa sản phẩm");
      }
      await refreshProducts();
    }
  };
}

export function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
