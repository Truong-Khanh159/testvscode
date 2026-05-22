"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export function AddToCartButton({ slug }: { slug: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      className="focus-ring rounded-full bg-rosewood px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-[#783944]"
      onClick={() => {
        addItem(slug);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      type="button"
    >
      {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
    </button>
  );
}
