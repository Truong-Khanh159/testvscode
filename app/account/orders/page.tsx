import { UserOrders } from "@/components/UserOrders";
import { redirectIfUnauthenticated } from "@/lib/server/auth";

export default async function AccountOrdersPage() {
  await redirectIfUnauthenticated(undefined, "/login");
  return <UserOrders />;
}
