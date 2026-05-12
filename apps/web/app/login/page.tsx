import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginPage } from "@/components/auth/LoginPage";

export default async function Login() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return <LoginPage />;
}
