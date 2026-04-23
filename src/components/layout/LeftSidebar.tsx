"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, Bell, Bookmark, Search, Edit3, ShieldCheck, LogIn, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, // <--- Added this import
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadCount } from "@/features/notifications/hooks/useNotifications";

interface LeftSidebarProps {
  onPostClick: () => void;
}

// Define a custom interface to tell TypeScript about your custom user fields
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  roles?: string[];
  avatarUrl?: string;
  displayName?: string;
}

export default function LeftSidebar({ onPostClick }: LeftSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Safely cast the session user to our ExtendedUser instead of 'any'
  const user = session?.user as ExtendedUser | undefined;
  
  // Check roles
  const isAdmin = user?.role === "ADMIN" || user?.roles?.includes("ADMIN") || user?.email === "admin@admin.com";

  // Fetch unread notification count (React Query will handle caching and polling)
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount || 0;

  // Base navigation items
  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home, isPublic: true },
    { name: "Explore", href: "/explore", icon: Search, isPublic: false },
    { name: "Notifications", href: "/notifications", icon: Bell, isPublic: false, badgeCount: unreadCount },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark, isPublic: false },
  ];

  // Logic 1: Filter to only show 'Home' if not logged in.
  const visibleNavItems = navItems.filter((item) => item.isPublic || !!session);

  // Logic 2: Inject Admin Panel link conditionally
  if (isAdmin) {
    visibleNavItems.push({ name: "Admin", href: "/admin", icon: ShieldCheck, isPublic: false });
  }

  return (
    <div className="flex flex-col h-full w-full pt-8 pb-6 px-2 xl:px-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* Logo Area - Minimalist, Serif Style */}
      <Link href="/dashboard" className="flex items-center justify-center xl:justify-start mb-10 xl:ml-3 cursor-pointer w-fit opacity-90 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl">
            B
          </div>
          <span className="hidden xl:block font-serif font-bold text-3xl tracking-tight text-slate-900">Back2U</span>
        </div>
      </Link>

      {/* Navigation Links - Medium Style */}
      <nav className="flex flex-col gap-7 w-full mt-2">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (item.name === "Home" && pathname === "/");
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center justify-center xl:justify-start gap-5 px-3 cursor-pointer w-fit transition-all ${
                  isActive ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900 font-normal"
                }`}
              >
                <div className="relative">
                  <item.icon size={26} strokeWidth={isActive ? 2.5 : 1.5} />
                  
                  {/* Notification Badge */}
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-[#f0f2f5]">
                      {item.badgeCount > 9 ? "9+" : item.badgeCount}
                    </span>
                  ) : null}
                </div>
                
                <span className="hidden xl:block text-[18px]">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Write / Post Button */}
      {!!session && (
        <button 
          onClick={onPostClick}
          className="mt-8 flex items-center justify-center xl:justify-start gap-5 px-3 w-fit text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Edit3 size={26} strokeWidth={1.5} />
          <span className="hidden xl:block text-[18px] font-normal">Write</span>
        </button>
      )}

      {/* Profile & Login Snippet */}
      <div className="mt-auto pt-4 flex flex-col gap-4 w-full border-t border-slate-200/60">
        {!session ? (
          <Link href="/login" className="flex items-center justify-center xl:justify-start gap-4 px-3 py-2 cursor-pointer w-fit text-slate-500 hover:text-slate-900 transition-colors">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
              <LogIn size={18} strokeWidth={1.5} />
            </div>
            <span className="hidden xl:block font-medium text-[16px]">Sign In</span>
          </Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center justify-center xl:justify-start gap-3 px-2 py-2 cursor-pointer w-full transition-all hover:bg-slate-200/50 rounded-2xl group">
                
                <Avatar className="w-10 h-10 border border-slate-200 group-hover:ring-2 ring-slate-300 transition-all shrink-0">
                  <AvatarImage src={user?.image || user?.avatarUrl || undefined} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                {/* Expanded to show name AND email */}
                <div className="hidden xl:flex flex-col flex-1 truncate text-left">
                  <span className="font-bold text-[14px] leading-tight truncate text-slate-900">
                    {user?.name || user?.displayName}
                  </span>
                  <span className="text-[12px] leading-tight truncate text-slate-500 mt-0.5">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            
            {/* Dropdown Menu Content */}
            <DropdownMenuContent align="end" sideOffset={12} className="w-56 rounded-2xl shadow-sm border-slate-200 p-2">
              {/* Wrapped the label and items inside the Group component */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-black text-xs text-slate-400 uppercase tracking-widest mb-1">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mb-2" />
                
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer py-2.5 rounded-xl font-medium focus:bg-slate-100">
                    <Settings className="mr-3 h-4 w-4 text-slate-500" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 py-2.5 rounded-xl font-medium mt-1"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
    </div>
  );
}
