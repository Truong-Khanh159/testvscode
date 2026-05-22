"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link className="text-xl font-black tracking-tight text-rosewood" href="/">
          Bloomé
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-rosewood/80 md:flex">
          <Link className="transition hover:text-rosewood" href="/#products">Sản phẩm</Link>
          <Link className="transition hover:text-rosewood" href="/#about">Dịch vụ</Link>
          <Link className="transition hover:text-rosewood" href="/checkout">Đặt hàng</Link>
          <Link className="transition hover:text-rosewood" href="/account/orders">Đơn của tôi</Link>
          <Link className="transition hover:text-rosewood" href="/login">Đăng nhập</Link>
        </div>
        <ThemeToggle />
        <Link
          className="focus-ring rounded-full bg-white px-4 py-2 text-sm font-semibold text-rosewood shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
          href="/cart"
        >
          Giỏ hàng <span className="ml-1 rounded-full bg-blush px-2 py-0.5">{totalItems}</span>
        </Link>
      </nav>
    </header>
  );
}
