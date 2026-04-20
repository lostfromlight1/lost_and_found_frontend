import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/config/auth-options";
import Link from "next/link";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { SquaresFourIcon, GearIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr";
// Make sure this import exists since we are using <Navbar /> below
import { Navbar } from "@/components/navbar/Navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = session.user;
  const userRole = user?.role;

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="font-bold text-xl text-primary tracking-tight">
            Lost & Found
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium"
          >
            <SquaresFourIcon size={20} />
            Dashboard
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors font-medium"
          >
            <GearIcon size={20} />
            Settings
          </Link>

          {/* Conditional Admin Link - Kept Teammate's Blue Style */}
          {userRole === "ADMIN" && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Management
              </p>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors font-medium"
              >
                <ShieldCheckIcon size={20} />
                Admin Panel
              </Link>
            </div>
          )}
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Kept Teammate's Navbar */}
        <Navbar user={user} />

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}