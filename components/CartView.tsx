"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { useCart } from "./CartProvider";
import { useProducts } from "./ProductStore";

export function CartView() {
  const { items, updateItem, removeItem } = useCart();
  const { products } = useProducts();
  const cartProducts = items
    .map((item) => ({
      item,
      product: products.find((product) => product.slug === item.slug)
    }))
    .filter((entry) => entry.product);
  const subtotal = cartProducts.reduce((sum, entry) => sum + entry.product!.price * entry.item.quantity, 0);

  if (cartProducts.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-6xl">🧺</p>
        <h1 className="mt-6 text-4xl font-black text-rosewood">Giỏ hàng đang trống</h1>
        <p className="mt-3 text-rosewood/70">Chọn vài bó hoa trước khi đặt hàng.</p>
        <Link className="mt-8 inline-flex rounded-full bg-rosewood px-6 py-3 font-bold text-white" href="/#products">
          Xem sản phẩm
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-rosewood">Giỏ hàng</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cartProducts.map(({ item, product }) => (
            <div className="glass flex gap-4 rounded-[1.5rem] p-4 shadow-soft" key={item.slug}>
              <div className={`grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gradient-to-br ${product!.palette}`}>
                <span className="text-4xl">{product!.emoji}</span>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-black text-rosewood">{product!.name}</p>
                  <p className="text-sm text-rosewood/65">{formatCurrency(product!.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    aria-label={`Số lượng ${product!.name}`}
                    className="focus-ring w-20 rounded-full border border-blush bg-white px-4 py-2 text-center"
                    min={1}
                    onChange={(event) => updateItem(item.slug, Number(event.target.value))}
                    type="number"
                    value={item.quantity}
                  />
                  <button className="text-sm font-bold text-rosewood/65 hover:text-rosewood" onClick={() => removeItem(item.slug)} type="button">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="glass h-fit rounded-[2rem] p-6 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-rosewood/50">Tạm tính</p>
          <p className="mt-3 text-3xl font-black text-rosewood">{formatCurrency(subtotal)}</p>
          <p className="mt-3 text-sm leading-6 text-rosewood/65">Phí giao hàng được xác nhận sau khi shop kiểm tra địa chỉ.</p>
          <Link className="mt-6 flex justify-center rounded-full bg-rosewood px-6 py-3 font-bold text-white transition hover:-translate-y-0.5" href="/checkout">
            Điền form đặt hàng
          </Link>
        </aside>
      </div>
    </section>
  );
}
