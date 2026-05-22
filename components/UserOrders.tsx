"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Order } from "./OrderStore";

export function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetch("/api/user/orders", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : []))
        .then(setOrders)
        .catch(() => undefined);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-black text-rosewood">Lịch sử đơn hàng</h1>
      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <article className="glass rounded-[1.5rem] p-5 shadow-sm" key={order.id}>
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-rosewood/60">{order.id}</p>
                <h2 className="text-xl font-black text-rosewood">{order.customerName}</h2>
                <p className="text-sm text-rosewood/65">{order.status}</p>
              </div>
              <p className="font-black text-rosewood">{formatCurrency(order.subtotal)}</p>
            </div>
          </article>
        ))}
        {orders.length === 0 ? <p className="text-rosewood/65">Bạn chưa có đơn hàng.</p> : null}
      </div>
    </section>
  );
}
