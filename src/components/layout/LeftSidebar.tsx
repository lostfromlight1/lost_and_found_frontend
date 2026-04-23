"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, Bell, Bookmark, User as UserIcon, Edit3, ShieldCheck, LogIn, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadCount } from "@/features/notifications/hooks/useNotifications";
import ConfirmationDialog from "@/components/model/ConfirmationDialog"; // <--- ADDED IMPORT

interface LeftSidebarProps {
  onPostClick: () => void;
}

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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false); // <--- STATE ADDED
  
  const user = session?.user as ExtendedUser | undefined;
  const isAdmin = user?.role === "ADMIN" || user?.roles?.includes("ADMIN") || user?.email === "admin@admin.com";

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount || 0;

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home, isPublic: true },
    { name: "Profile", href: "/profile", icon: UserIcon, isPublic: false },
    { name: "Notifications", href: "/notifications", icon: Bell, isPublic: false, badgeCount: unreadCount },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark, isPublic: false },
  ];

  const visibleNavItems = navItems.filter((item) => item.isPublic || !!session);

  if (isAdmin) {
    visibleNavItems.push({ name: "Admin", href: "/admin", icon: ShieldCheck, isPublic: false });
  }

  return (
    <>
      <div className="flex flex-col h-full w-full pt-8 pb-6 px-2 xl:px-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Logo Area */}
        <Link href="/dashboard" className="flex items-center justify-center xl:justify-start mb-8 xl:ml-3 cursor-pointer w-fit mx-auto xl:mx-0 opacity-90 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl">
              B
            </div>
            <span className="hidden xl:block font-serif font-bold text-3xl tracking-tight text-slate-900">Back2U</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 w-full mt-2">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || (item.name === "Home" && pathname === "/");
            return (
              <Link key={item.name} href={item.href} className="flex justify-center xl:justify-start w-full">
                <div
                  className={`flex items-center justify-center xl:justify-start gap-5 p-3 xl:px-4 xl:py-3 rounded-full cursor-pointer transition-all hover:bg-slate-200/50 w-fit xl:w-full ${
                    isActive ? "text-slate-900 font-bold" : "text-slate-500 font-normal"
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <item.icon size={26} strokeWidth={isActive ? 2.5 : 1.5} />
                    
                    {/* Notification Badge */}
                    {item.badgeCount && item.badgeCount > 0 ? (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-[#f0f2f5]">
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
            className="mt-4 flex items-center justify-center xl:justify-start gap-5 p-3 xl:px-4 xl:py-3 rounded-full w-fit mx-auto xl:mx-0 xl:w-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-all"
          >
            <Edit3 size={26} strokeWidth={1.5} />
            <span className="hidden xl:block text-[18px] font-normal">Write</span>
          </button>
        )}

        {/* Profile & Login Snippet */}
        <div className="mt-auto pt-4 flex flex-col gap-2 w-full border-t border-slate-200/60">
          {!session ? (
            <Link href="/login" className="flex items-center justify-center xl:justify-start gap-5 p-3 xl:px-4 xl:py-3 rounded-full cursor-pointer w-fit mx-auto xl:mx-0 xl:w-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-colors">
              <LogIn size={26} strokeWidth={1.5} />
              <span className="hidden xl:block text-[18px] font-normal">Sign In</span>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none w-full flex justify-center xl:justify-start">
                <div className="flex items-center justify-center xl:justify-start gap-3 p-2 xl:px-3 xl:py-2 cursor-pointer w-fit xl:w-full transition-all hover:bg-slate-200/50 rounded-full xl:rounded-2xl group">
                  <Avatar className="w-10 h-10 border border-slate-200 group-hover:ring-2 ring-slate-300 transition-all shrink-0">
                    <AvatarImage src={user?.image || user?.avatarUrl || undefined} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
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
              
              <DropdownMenuContent align="end" sideOffset={12} className="w-56 rounded-2xl shadow-sm border-slate-200 p-2">
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
                  
                  {/* CHANGED: Now opens the dialog instead of instantly logging out */}
                  <DropdownMenuItem 
                    onClick={() => setIsLogoutDialogOpen(true)}
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

      {/* NEW: Logout Confirmation Dialog */}
      <ConfirmationDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="Sign Out"
        description="Are you sure you want to sign out of your account? You will need to log back in to access your dashboard."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onConfirm={() => signOut({ callbackUrl: '/login' })}
      />
    </>
  );
}
