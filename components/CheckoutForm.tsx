"use client";

import { FormEvent, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { useCart } from "./CartProvider";
import { useOrders } from "./OrderStore";
import { useProducts } from "./ProductStore";

function createOrderTimestamp() {
  return new Date();
}

export function CheckoutForm() {
  const { items, totalItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { products } = useProducts();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const subtotal = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const orderItems = items
      .map((item) => {
        const product = products.find((entry) => entry.slug === item.slug);
        return product
          ? {
              slug: item.slug,
              name: product.name,
              price: product.price,
              quantity: item.quantity
            }
          : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const orderTimestamp = createOrderTimestamp();

    try {
      await addOrder({
        id: `ORD-${orderTimestamp.getTime()}`,
        createdAt: orderTimestamp.toISOString(),
        customerName: String(formData.get("name") ?? ""),
        customerEmail: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        receiver: String(formData.get("receiver") ?? ""),
        deliveryTime: String(formData.get("deliveryTime") ?? ""),
        address: String(formData.get("address") ?? ""),
        message: String(formData.get("message") ?? ""),
        items: orderItems,
        subtotal,
        status: "new"
      });
      setSubmitted(true);
      clearCart();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi đơn hàng");
    }
  }

  if (submitted) {
    return (
      <div className="glass mx-auto max-w-2xl rounded-[2rem] p-8 text-center shadow-soft">
        <p className="text-6xl">💌</p>
        <h1 className="mt-5 text-3xl font-black text-rosewood">Đã nhận yêu cầu đặt hoa</h1>
        <p className="mt-3 text-rosewood/70">Shop sẽ liên hệ xác nhận mẫu hoa, phí giao và thời gian giao sớm nhất.</p>
      </div>
    );
  }

  return (
    <form className="glass mx-auto grid max-w-4xl gap-5 rounded-[2rem] p-5 shadow-soft sm:p-8" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rosewood/50">Form đặt hàng</p>
        <h1 className="mt-2 text-3xl font-black text-rosewood">Thông tin giao hoa</h1>
        <p className="mt-2 text-sm text-rosewood/65">
          {totalItems > 0 ? `${totalItems} sản phẩm · ${formatCurrency(subtotal)}` : "Bạn có thể gửi yêu cầu, shop sẽ tư vấn mẫu phù hợp."}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="focus-ring rounded-2xl border border-blush bg-white/80 px-4 py-3" name="name" placeholder="Họ tên người đặt" required />
        <input className="focus-ring rounded-2xl border border-blush bg-white/80 px-4 py-3" name="email" placeholder="Email nhận thông báo đơn hàng" type="email" />
        <input className="focus-ring rounded-2xl border border-blush bg-white/80 px-4 py-3" name="phone" placeholder="Số điện thoại" required />
        <input className="focus-ring rounded-2xl border border-blush bg-white/80 px-4 py-3" name="receiver" placeholder="Tên người nhận" />
        <input className="focus-ring rounded-2xl border border-blush bg-white/80 px-4 py-3" name="deliveryTime" placeholder="Thời gian giao mong muốn" />
      </div>
      <input className="focus-ring rounded-2xl border border-blush bg-white/80 px-4 py-3" name="address" placeholder="Địa chỉ giao hoa" required />
      <textarea className="focus-ring min-h-32 rounded-2xl border border-blush bg-white/80 px-4 py-3" name="message" placeholder="Lời nhắn trên thiệp hoặc yêu cầu riêng" />
      <button className="focus-ring rounded-full bg-rosewood px-7 py-4 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-[#783944]" type="submit">
        Gửi đơn đặt hoa
      </button>
      {error ? <p className="text-sm font-bold text-rosewood">{error}</p> : null}
    </form>
  );
}
