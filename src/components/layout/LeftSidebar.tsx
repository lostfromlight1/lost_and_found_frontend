"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquaresFourIcon, GearIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { cn } from "@/lib/utils";

interface LeftSidebarProps {
  userRole?: string | null;
}

export default function LeftSidebar({ userRole }: LeftSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: SquaresFourIcon },
    { name: "Settings", href: "/settings", icon: GearIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r flex-col hidden md:flex h-full overflow-y-auto shrink-0 sticky top-0">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm",
                isActive ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon size={20} weight={isActive ? "fill" : "regular"} />
              {item.name}
            </Link>
          );
        })}

        {userRole === "ADMIN" && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Management
            </p>
            <Link 
              href="/admin" 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm",
                pathname.startsWith("/admin") ? "bg-red-100 text-red-700" : "text-red-600 hover:bg-red-50"
              )}
            >
              <ShieldCheckIcon size={20} weight={pathname.startsWith("/admin") ? "fill" : "regular"}  />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

     
    </aside>
  );
}
