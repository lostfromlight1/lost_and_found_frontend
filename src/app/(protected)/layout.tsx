import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/config/auth-options";
import Link from "next/link";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { SquaresFourIcon, GearIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr";
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

          {/* Conditional Admin Link */}
          {userRole === "ADMIN" && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Management
              </p>
<<<<<<< HEAD
              <Link
                href="/admin"
=======
              <Link 
                href="/admin" 
>>>>>>> 91f653255abafd470433bb0d40822faaad53789b
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-blue-600 hover:bg-red-50 transition-colors font-medium"
              >
                <ShieldCheckIcon size={20} />
                Admin Panel
              </Link>
            </div>
          )}
        </nav>

       
      </aside>

      {/* ================= MAIN CONTENT ================= */}
{/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
<<<<<<< HEAD

        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm z-10">
          <div className="font-medium text-slate-800">
            {/* Optional Breadcrumbs or Title could go here */}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">
              Logged in as <span className="font-semibold text-slate-900">{user?.displayName || user?.email}</span>
            </span>

            {/* Renders the Cloudinary Avatar if available, otherwise falls back to the initial */}
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || "User avatar"}
                className="h-8 w-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
        </header>

        {/* PAGE RENDER AREA */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl">
            {children}
          </div>
        </main>
=======
        <Navbar user={user} />

        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-7xl mx-auto"> 
            {children}
          </div>
        </main>      
>>>>>>> 91f653255abafd470433bb0d40822faaad53789b
      </div>
    </div>


  );
}
