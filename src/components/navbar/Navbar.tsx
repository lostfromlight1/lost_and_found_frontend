"use client";

import { BellIcon, SignOutIcon } from "@phosphor-icons/react";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

interface NavbarProps {
  user: {
    displayName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
}

export function Navbar({ user }: NavbarProps) {
  const userInitial =
    user?.displayName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm sticky top-0 z-30">
      {/* Left side: Breadcrumbs or Search (Empty for now as per your design) */}
      <div className="hidden md:block">
        <h2 className="text-sm font-medium text-slate-500">Overview</h2>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <BellIcon size={22} weight="regular" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">
              {user?.displayName || "User"}
            </p>
            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          </div>

          {/* Avatar */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              {userInitial}
            </div>
          )}
        </div>

        {/* Integrated Logout (Using your existing SignOutButton logic) */}
        <div className="relative z-10 ml-2 cursor-pointer">
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
