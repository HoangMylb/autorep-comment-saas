import { AuthForm } from "@/frontend/features/auth/components/auth-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <AuthForm mode="register" />
    </div>
  );
}
