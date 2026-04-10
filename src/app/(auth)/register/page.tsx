import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Create Account | Lost & Found",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <RegisterForm />
    </div>
  );
}
