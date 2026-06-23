"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Bell,
  Bookmark,
  User as UserIcon,
  Edit3,
  ShieldCheck,
  LogIn,
  LogOut,
  Settings,
} from "lucide-react";
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
import ConfirmationDialog from "@/components/model/ConfirmationDialog";

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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const user = session?.user as ExtendedUser | undefined;
  const isAdmin =
    user?.role === "ADMIN" ||
    user?.roles?.includes("ADMIN") ||
    user?.email === "admin@admin.com";

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount || 0;

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home, isPublic: true },
    { name: "Profile", href: "/profile", icon: UserIcon, isPublic: false },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      isPublic: false,
      badgeCount: unreadCount,
    },
    {
      name: "Bookmarks",
      href: "/bookmarks",
      icon: Bookmark,
      isPublic: false,
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.isPublic || !!session);

  if (isAdmin) {
    visibleNavItems.push({
      name: "Admin",
      href: "/admin",
      icon: ShieldCheck,
      isPublic: false,
    });
  }

  return (
    <>
      {/* FIXED: Added sticky, h-screen, and overflow-y-auto to allow independent scrolling */}
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-y-auto px-3 py-5 xl:px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="rounded-[28px] border border-[#b7cfb2] bg-[#edf5eb]/92 p-4 shadow-[0_10px_30px_rgba(42,63,63,0.08)] backdrop-blur-sm">
          <Link
            href="/dashboard"
            className="mb-6 flex items-center gap-3 rounded-[18px] px-3 py-2 transition hover:bg-[#dcead8]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2a3f3f] text-xl font-bold text-white shadow-sm">
              B
            </div>
            <span className="text-[2rem] font-bold tracking-tight text-[#2a3f3f]">
              Back2U
            </span>
          </Link>

          <nav className="flex flex-col gap-2">
            {visibleNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.name === "Home" && pathname === "/dashboard");
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`group flex items-center gap-4 rounded-[16px] px-4 py-3 transition ${isActive
                      ? "bg-[#467750] text-white shadow-sm"
                      : "text-[#49645c] hover:bg-[#dcead8] hover:text-[#2a3f3f]"
                      }`}
                  >
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full ${isActive ? "bg-white/18" : "bg-white/60"
                        }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
                      {item.badgeCount && item.badgeCount > 0 ? (
                        <span
                          className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ring-2 ${isActive
                            ? "bg-[#f0cd6e] text-[#2a3f3f] ring-[#467750]"
                            : "bg-[#2a3f3f] text-white ring-[#edf5eb]"
                            }`}
                        >
                          {item.badgeCount > 9 ? "9+" : item.badgeCount}
                        </span>
                      ) : null}
                    </div>

                    <span
                      className={`text-[15px] ${isActive ? "font-extrabold" : "font-semibold"
                        }`}
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {!!session && (
            <button
              onClick={onPostClick}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-[18px] bg-[#2a3f3f] px-4 py-3 text-[15px] font-extrabold text-white shadow-sm transition hover:bg-[#223535]"
            >
              <Edit3 size={18} />
              Write a note
            </button>
          )}
        </div>

        <div className="mt-auto pt-4">
          {!session ? (
            <Link href="/login">
              <div className="flex items-center gap-3 rounded-[20px] border border-[#b7cfb2] bg-[#edf5eb]/92 px-4 py-3 text-[#46615a] shadow-[0_8px_20px_rgba(42,63,63,0.06)] transition hover:bg-[#dcead8] hover:text-[#2a3f3f]">
                <LogIn size={18} />
                <span className="font-semibold">Sign In</span>
              </div>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full outline-none">
                <div className="flex w-full items-center gap-3 rounded-[22px] border border-[#b7cfb2] bg-[#edf5eb]/92 p-3 shadow-[0_8px_20px_rgba(42,63,63,0.06)] transition hover:bg-[#dcead8]">
                  <Avatar className="h-11 w-11 border border-[#b7cfb2] shadow-sm">
                    <AvatarImage
                      src={user?.image || user?.avatarUrl || undefined}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-[#cfe2d0] font-bold text-[#2a3f3f]">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-[14px] font-extrabold text-[#2a3f3f]">
                      {user?.name || user?.displayName}
                    </div>
                    <div className="truncate text-[12px] text-[#5f756d]">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-56 rounded-2xl border border-[#c5d6c8] bg-[#f7fbf7]/95 p-2 shadow-xl backdrop-blur-md"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-[#6f867d]">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mb-2" />

                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 font-medium focus:bg-[#e8f1e8]">
                      <Settings className="mr-3 h-4 w-4 text-[#5f756d]" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem
                    onClick={() => setIsLogoutDialogOpen(true)}
                    className="mt-1 cursor-pointer rounded-xl py-2.5 font-medium text-red-600 focus:bg-red-50 focus:text-red-600"
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

      <ConfirmationDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="Sign Out"
        description="Are you sure you want to sign out of your account? You will need to log back in to access your dashboard."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onConfirm={() => signOut({ callbackUrl: "/login" })}
      />
    </>
  );
}