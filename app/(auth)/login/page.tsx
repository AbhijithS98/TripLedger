import { LoginForm } from "@/components/auth/LoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else if (session.user.role === "AGENT") {
      redirect("/agent");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <LoginForm />
    </div>
  );
}
