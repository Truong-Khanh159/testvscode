"use client";

import { ProductCard } from "./ProductCard";
import { useProducts } from "./ProductStore";

export function ProductGrid() {
  const { products } = useProducts();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard product={product} key={product.slug} />
      ))}
    </div>
  );
}
