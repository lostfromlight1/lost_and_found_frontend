"use client";

import Link from "next/link";
import Image from "next/image";

interface NavbarProps {
  user?: {
    displayName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#b7cfb2] bg-[#dcead8]/90 px-6 backdrop-blur-md">
      <Link
        href="/dashboard"
        className="text-2xl font-bold tracking-tight text-[#2a3f3f]"
      >
        Back2U
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <span className="hidden text-[#587066] sm:inline-block">
          {user?.email}
        </span>

        <div className="flex items-center gap-2 rounded-full border border-[#b7cfb2] bg-white/70 px-2 py-1 shadow-sm">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user?.displayName || "User avatar"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#cfe2d0] font-bold text-[#2a3f3f]">
              {user?.displayName?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>
          )}

          <span className="max-w-[160px] truncate font-semibold text-[#2a3f3f]">
            {user?.displayName || user?.email}
          </span>
        </div>
      </div>
    </header>
  );
}