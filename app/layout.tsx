import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ZaloButton } from "@/components/ZaloButton";

export const metadata: Metadata = {
  metadataBase: new URL("https://bloome.vn"),
  title: {
    default: "Bloomé Flower Shop | Hoa pastel giao nhanh",
    template: "%s | Bloomé Flower Shop"
  },
  description: "Website bán hoa hiện đại với bó hoa pastel, hộp hoa, form đặt hàng và tư vấn qua Zalo.",
  keywords: ["shop hoa", "hoa pastel", "đặt hoa online", "bó hoa đẹp", "giao hoa"],
  openGraph: {
    url: "https://bloome.vn",
    title: "Bloomé Flower Shop",
    description: "Hoa pastel hiện đại, giao nhanh trong ngày.",
    type: "website",
    locale: "vi_VN"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <ZaloButton />
        </CartProvider>
      </body>
    </html>
  );
}
