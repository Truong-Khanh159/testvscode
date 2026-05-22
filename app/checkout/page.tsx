import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Đặt hàng",
  description: "Điền thông tin giao hoa và lời nhắn để Bloomé xác nhận đơn hàng."
};

export default function CheckoutPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <CheckoutForm />
    </section>
  );
}
