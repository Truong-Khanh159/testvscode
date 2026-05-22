import { ChangePasswordForm } from "@/components/AuthForms";
import { redirectIfUnauthenticated } from "@/lib/server/auth";

export default async function ChangePasswordPage() {
  await redirectIfUnauthenticated(undefined, "/login");
  return <ChangePasswordForm />;
}
