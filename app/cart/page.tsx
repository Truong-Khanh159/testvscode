import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: "Kiểm tra sản phẩm đã chọn trước khi đặt hoa tại Bloomé."
};

export default function CartPage() {
  return <CartView />;
}
