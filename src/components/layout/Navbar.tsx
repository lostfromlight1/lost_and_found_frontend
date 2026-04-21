"use client";

import Link from "next/link";
import Image from "next/image";

interface NavbarProps {
  user?: {
    displayName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-20 shrink-0 sticky top-0 w-full">
      <Link href="/dashboard" className="font-bold text-xl text-primary tracking-tight">
        Lost & Found
      </Link>
      
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-500 hidden sm:inline-block">
          <span className="font-semibold text-slate-900">{user?.displayName || user?.email}</span>
        </span>
        
        {user?.avatarUrl ? (
          <Image 
            src={user.avatarUrl} 
            alt={user?.displayName || "User avatar"} 
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>
    </header>
  );
}
