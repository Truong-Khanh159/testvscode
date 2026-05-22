"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatCurrency } from "@/lib/format";
import { useProducts } from "./ProductStore";

export function ProductDetailView({ slug }: { slug: string }) {
  const { products } = useProducts();
  const product = products.find((entry) => entry.slug === slug);

  if (!product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-6xl">🌿</p>
        <h1 className="mt-6 text-4xl font-black text-rosewood">Không tìm thấy sản phẩm</h1>
        <p className="mt-3 text-rosewood/70">Sản phẩm có thể đã bị xóa trong admin.</p>
        <Link className="mt-8 inline-flex rounded-full bg-rosewood px-6 py-3 font-bold text-white" href="/#products">
          Quay lại danh sách
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
      <div className="glass rounded-[3rem] p-5 shadow-soft">
        <div className={`grid aspect-square place-items-center overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${product.palette}`}>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl} />
          ) : (
            <span className="animate-float text-[10rem]">{product.emoji}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <Link className="text-sm font-bold text-rosewood/60 hover:text-rosewood" href="/#products">
          ← Quay lại sản phẩm
        </Link>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-rosewood/55">{product.category}</p>
        <h1 className="mt-3 text-5xl font-black text-rosewood">{product.name}</h1>
        <p className="mt-5 text-2xl font-black text-rosewood">{formatCurrency(product.price)}</p>
        <p className="mt-5 text-lg leading-8 text-rosewood/70">{product.description}</p>
        <ul className="mt-6 grid gap-3 text-rosewood/75">
          {product.details.map((detail) => (
            <li className="rounded-2xl bg-white/65 px-4 py-3" key={detail}>
              ✓ {detail}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-4">
          <AddToCartButton slug={product.slug} />
          <Link className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-rosewood shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft" href="/checkout">
            Đặt nhanh
          </Link>
        </div>
      </div>
    </section>
  );
}
