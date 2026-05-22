"use client";

import { useCallback, useEffect, useState } from "react";
import { csrfFetch } from "@/lib/client/csrf";

export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  receiver: string;
  deliveryTime: string;
  address: string;
  message: string;
  items: OrderItem[];
  subtotal: number;
  status: "new" | "confirmed" | "completed" | "canceled";
};

export function useOrders(loadAdminOrders = false, autoRefreshMs = 0) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const refreshOrders = useCallback(async () => {
    if (!loadAdminOrders) {
      return;
    }

    const response = await fetch("/api/orders", { cache: "no-store" });
    if (response.status === 401) {
      setIsUnauthorized(true);
      return;
    }
    if (!response.ok) {
      throw new Error("Không thể tải đơn hàng");
    }

    setOrders(await response.json());
    setIsUnauthorized(false);
  }, [loadAdminOrders]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      refreshOrders().catch(() => undefined);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshOrders]);

  useEffect(() => {
    if (!loadAdminOrders || autoRefreshMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      refreshOrders().catch(() => undefined);
    }, autoRefreshMs);

    return () => window.clearInterval(intervalId);
  }, [autoRefreshMs, loadAdminOrders, refreshOrders]);

  return {
    orders,
    isUnauthorized,
    refreshOrders,
    addOrder: async (order: Order) => {
      const response = await csrfFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
      if (!response.ok) {
        throw new Error("Không thể tạo đơn hàng");
      }
      if (loadAdminOrders) {
        await refreshOrders();
      }
    },
    updateOrderStatus: async (id: string, status: Order["status"]) => {
      const response = await csrfFetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error("Không thể cập nhật đơn hàng");
      }
      await refreshOrders();
    },
    deleteOrder: async (id: string) => {
      const response = await csrfFetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Không thể xóa đơn hàng");
      }
      await refreshOrders();
    }
  };
}
