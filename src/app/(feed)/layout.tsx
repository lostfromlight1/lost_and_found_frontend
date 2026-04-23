import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/config/auth-options";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    // Only a full-height container. NO Navbar. NO wrappers that mess with the width.
    <div className="min-h-screen bg-white text-slate-900">
      {children}
    </div>
  );
}
