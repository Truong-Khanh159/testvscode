import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { redirectIfAuthenticated } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: "Đăng nhập admin",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLoginPage() {
  await redirectIfAuthenticated();
  return <AdminLoginForm />;
}
