import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";
import { redirectIfUnauthenticated } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminDashboardPage() {
  await redirectIfUnauthenticated(["ADMIN", "STAFF"]);
  return <AdminDashboard />;
}
