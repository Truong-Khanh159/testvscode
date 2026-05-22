import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/products";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group glass animate-fadeUp overflow-hidden rounded-[2rem] p-4 shadow-soft transition duration-300 hover:-translate-y-2">
      <Link href={`/products/${product.slug}`} aria-label={`Xem ${product.name}`}>
        <div className={`grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${product.palette}`}>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={product.imageUrl} />
          ) : (
            <span className="animate-float text-7xl drop-shadow-sm">{product.emoji}</span>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rosewood/55">{product.category}</p>
          <Link className="mt-1 block text-xl font-black text-rosewood" href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-rosewood/70">{product.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-black text-rosewood">{formatCurrency(product.price)}</p>
          <AddToCartButton slug={product.slug} />
        </div>
      </div>
    </article>
  );
}
