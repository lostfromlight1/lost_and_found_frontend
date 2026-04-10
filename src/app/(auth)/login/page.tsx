import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Login | Lost & Found",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <LoginForm />
    </div>
  );
}
