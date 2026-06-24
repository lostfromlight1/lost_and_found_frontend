"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Mail, MapPin, Shield, ExternalLink, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { usePublicUserProfile } from "../hooks/useUsers";

type UserMiniProfilePopoverProps = {
    userId: number;
    displayName?: string | null;
    avatarUrl?: string | null;
    children: React.ReactNode;
};

export default function UserMiniProfilePopover({
    userId,
    displayName,
    avatarUrl,
    children,
}: UserMiniProfilePopoverProps) {
    const {
        data: user,
        isLoading,
        isError,
    } = usePublicUserProfile(userId);

    const fallbackName = useMemo(
        () => displayName?.trim() || "Unknown User",
        [displayName],
    );

    const profileHref = `/users/${userId}`;

    return (
        <Popover>
            <PopoverTrigger asChild>{children}</PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={10}
                className="w-[320px] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl"
            >
                <div className="overflow-hidden rounded-2xl">
                    <div className="h-16 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50" />

                    <div className="px-4 pb-4">
                        <div className="-mt-8 flex items-end justify-between gap-3">
                            <Avatar className="h-16 w-16 rounded-full border-4 border-white shadow-sm">
                                <AvatarImage
                                    src={user?.avatarUrl || avatarUrl || undefined}
                                    alt={user?.displayName || fallbackName}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-slate-100 text-slate-700 text-lg font-semibold">
                                    {(user?.displayName || fallbackName).charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <Link
                                href={profileHref}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-1 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                                View profile
                                <ExternalLink size={13} />
                            </Link>
                        </div>

                        <div className="mt-3">
                            {isLoading ? (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Loader2 size={16} className="animate-spin" />
                                    Loading profile...
                                </div>
                            ) : isError || !user ? (
                                <>
                                    <h4 className="text-[16px] font-semibold text-slate-900">
                                        {fallbackName}
                                    </h4>
                                    <p className="mt-1 text-[13px] text-slate-500">
                                        Unable to load profile preview.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h4 className="truncate text-[16px] font-semibold text-slate-900">
                                                {user.displayName}
                                            </h4>
                                            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500 break-all">
                                                <Mail size={13} className="shrink-0" />
                                                {user.email}
                                            </p>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${user.role === "ADMIN"
                                                ? "bg-violet-50 text-violet-700 border border-violet-100"
                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </div>

                                    {user.contactInfo && (
                                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                                            <MapPin size={14} className="mt-0.5 shrink-0 text-[#1d9bf0]" />
                                            <p className="text-[13px] leading-5 text-slate-700 break-words">
                                                {user.contactInfo}
                                            </p>
                                        </div>
                                    )}

                                    {user.isLocked && (
                                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800">
                                            <Shield size={14} className="shrink-0" />
                                            This account is currently locked.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}