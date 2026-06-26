"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, isValid, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  MessageCircle,
  Share2,
  Pencil,
  Trash2,
  Flag,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MoreVertical,
  X,
  Phone,
  Gift,
  Bookmark,
  CalendarDays,
  Tag,
  HandHelping,
  ExternalLink,
  Copy,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PostResponseDto } from "@/features/post/api/response/posts.response";
import {
  usePostComments,
  useCreateComment,
} from "@/features/comments/hooks/useComments";
import {
  useDeletePost,
  useToggleLikePost,
  useToggleBookmarkPost,
} from "@/features/post/hooks/usePosts";
import PostFormModal from "@/features/post/components/PostFormModal";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import CommentInput from "@/features/comments/components/CommentInput";
import ReportModal from "@/features/reports/components/ReportModal";
import CommentCard, {
  CurrentUser,
} from "@/features/comments/components/CommentCard";
import { Button } from "@/components/ui/button";
import UserMiniProfilePopover from "@/features/users/components/UserMiniProfilePopover";

const MapDisplay = dynamic(() => import("@/components/map/MapDisplay"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-2xl bg-slate-50 animate-pulse border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
      Loading map...
    </div>
  ),
});

const safeDateTime = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const parsed =
    dateStr.length === 10
      ? new Date(`${dateStr}T00:00:00`)
      : new Date(dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`);
  return isValid(parsed) ? parsed : null;
};

const safeDateOnly = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? parseISO(dateStr)
    : new Date(dateStr);
  return isValid(parsed) ? parsed : null;
};

const formatDateTime = (dateStr?: string | null, fallback = "Unknown date") => {
  const parsed = safeDateTime(dateStr);
  return parsed ? format(parsed, "MMM d, yyyy · h:mm a") : fallback;
};

const formatDateOnly = (dateStr?: string | null, fallback = "Not specified") => {
  const parsed = safeDateOnly(dateStr);
  return parsed ? format(parsed, "MMM d, yyyy") : fallback;
};

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  action?: React.ReactNode;
};

function InfoRow({ icon, label, value, valueClassName = "", action }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:gap-4 sm:px-5">
      <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-[0.16em] shrink-0 sm:w-28">
        <span className="text-[#1d9bf0]">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div className={`min-w-0 text-[14px] sm:text-[15px] leading-6 text-slate-800 ${valueClassName}`}>
          {value}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

// ─── Status badge config ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
  const s = status?.toUpperCase() ?? "OPEN";


const cfg: Record<string, { dot: string; pill: string; label: string }> = {
  OPEN: {
    dot: "bg-blue-500",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Open",
  },
  CLOSE: {
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600 border-slate-200",
    label: "Resloved",
  },
  CLOSED: {  
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600 border-slate-200",
    label: "Closed",
  },
  RESOLVED: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Resolved",
  },
};

  const { dot, pill, label } = cfg[s] ?? cfg.OPEN;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold border rounded-full ${pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
      {label}
    </span>
  );
}

// ─── Type badge config ─────────────────────────────────────────────────────────
function TypeBadge({ type }: { type?: string }) {
  const t = type?.toUpperCase() ?? "";
  const isLost = t === "LOST";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold border rounded-full ${isLost
        ? "bg-red-50 text-red-600 border-red-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isLost ? "bg-red-500" : "bg-emerald-500"} shrink-0`} />
      {isLost ? "Lost" : "Found"}
    </span>
  );
}

// ─── Category badge config ─────────────────────────────────────────────────────
function CategoryBadge({ name }: { name?: string }) {
  if (!name) return null;
  return (
    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full">
      <Tag size={10} className="shrink-0" />
      {name}
    </span>
  );
}

type PostCardProps = {
  post: PostResponseDto;
  mode?: "feed" | "detail";
  targetCommentId?: number;
  targetReplyId?: number;
};


export default function PostCard({
  post,
  mode = "feed",
  targetCommentId,
  targetReplyId,
}: PostCardProps) {

  const router = useRouter();
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(mode === "detail");
  const [showMap, setShowMap] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(
  mode === "detail" ? (targetCommentId || targetReplyId ? 9999 : 10) : 3,
);

  const { data: comments, isLoading: isLoadingComments } = usePostComments(
    showComments ? post.id : 0,
  );
  const { mutate: addComment, isPending: isAddingComment } = useCreateComment();
  const { mutate: deletePost } = useDeletePost();
  const { mutate: toggleLike, isPending: isLiking } = useToggleLikePost();
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } =
    useToggleBookmarkPost();

  const currentUser = session?.user as CurrentUser | undefined;
  const isOwner = String(currentUser?.id) === String(post.user.id);
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isOwner || isAdmin;

  const displayedComments = comments?.slice(0, visibleCommentsCount) || [];
  const hasMoreComments = (comments?.length || 0) > visibleCommentsCount;

  const createdAtLabel = useMemo(() => formatDateTime(post.createdAt), [post.createdAt]);
  const lostFoundDateLabel = useMemo(() => formatDateOnly(post.lostFoundDate), [post.lostFoundDate]);

  const hasCoordinates =
    typeof post.latitude === "number" &&
    typeof post.longitude === "number" &&
    !Number.isNaN(post.latitude) &&
    !Number.isNaN(post.longitude);

  const rewardAmount = post.reward ?? 0;
  const postHref = `/posts/${post.id}`;

  const getShareUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}${postHref}`
      : postHref;

  // ─── Share handlers ──────────────────────────────────────────────────────────
  const handleShareFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(post.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`${post.title} — ${getShareUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleShareTelegram = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(post.title);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  // ─── Other handlers ──────────────────────────────────────────────────────────
  const submitPostComment = () => {
    if (!newComment.trim()) return;
    addComment(
      { postId: post.id, content: newComment.trim() },
      { onSuccess: () => setNewComment("") },
    );
  };

  const confirmDeletePost = () => {
    deletePost(post.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        if (mode === "detail") router.push("/");
      },
      onError: () => {
        toast.error("Failed to delete post");
        setIsDeleteDialogOpen(false);
      },
    });
  };

  const nextImage = useCallback(() => {
    setActiveImageIndex((prev) => Math.min(prev + 1, (post.images?.length || 1) - 1));
  }, [post.images?.length]);

  const prevImage = useCallback(() => {
    setActiveImageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen || !post.images?.length) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();

    };  


    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, post.images?.length, nextImage, prevImage]);

  useEffect(() => {
  if (!showComments || isLoadingComments) return;
  if (!targetCommentId && !targetReplyId) return;

  const elementId = targetReplyId
    ? `reply-${targetReplyId}`
    : `comment-${targetCommentId}`;

  const timer = setTimeout(() => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-[#1d9bf0]", "rounded-xl");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-[#1d9bf0]", "rounded-xl");
      }, 2000);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [showComments, isLoadingComments, targetCommentId, targetReplyId]);

  useEffect(() => {
  setVisibleCommentsCount(
    mode === "detail" ? (targetCommentId || targetReplyId ? 9999 : 10) : 3,
  );
}, [showComments, post.id, mode, targetCommentId, targetReplyId]);

  useEffect(() => {
    if (activeImageIndex > (post.images?.length || 1) - 1) {
      setActiveImageIndex(0);
    }
  }, [post.images?.length, activeImageIndex]);

  return (
    <>
      <article
        className={`w-full bg-white overflow-hidden transition-colors pt-3 ${mode === "feed" ? "hover:bg-slate-50/20" : ""
          }`}
        // ── Double-click navigates to full post in feed mode ──
        onDoubleClick={() => {
          if (mode === "feed") router.push(postHref);
        }}
      >
        {/* ── Header ── */}
        <div className="px-4 sm:px-5 flex flex-row items-start justify-between">
          <div className="flex gap-3 sm:gap-4 items-center">
            <UserMiniProfilePopover
              userId={post.user.id}
              displayName={post.user?.displayName}
              avatarUrl={post.user?.avatarUrl}
            >
              <button
                type="button"
                className="flex items-center gap-3 sm:gap-4 rounded-2xl transition-colors hover:bg-slate-50 -ml-1 px-1.5 py-1 text-left"
                aria-label={`Open profile preview for ${post.user?.displayName || "user"}`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                  <Avatar className="w-full h-full rounded-full ring-1 ring-slate-100 overflow-hidden aspect-square">
                    <AvatarImage
                      src={post.user?.avatarUrl || undefined}
                      alt={post.user?.displayName}
                      className="object-cover w-full h-full"
                    />
                    <AvatarFallback className="flex items-center justify-center bg-slate-50 text-slate-700 font-medium w-full h-full">
                      {post.user?.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[15px] text-slate-900 leading-tight hover:text-[#1d9bf0] transition-colors">
                    {post.user?.displayName || "Unknown User"}
                  </span>
                  <span className="text-[13px] text-slate-500 leading-tight mt-1">
                    {createdAtLabel}
                  </span>
                </div>
              </button>
            </UserMiniProfilePopover>
          </div>

          <div className="flex items-center gap-2">
            {/* ── Nicer status / type / category badges ── */}
            <StatusBadge status={post.status} />
            <TypeBadge type={post.type} />
            <CategoryBadge name={post.category?.name} />

            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 ml-1 transition-colors outline-none rounded-full flex items-center justify-center">
                  <MoreVertical size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-100 shadow-md p-1">
                  {isOwner && (
                    <DropdownMenuItem
                      onClick={() => setIsEditModalOpen(true)}
                      className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50"
                    >
                      <Pencil size={14} className="mr-2" /> Edit Post
                    </DropdownMenuItem>
                  )}
                  {canManage && (
                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg font-medium py-2 px-3 focus:bg-red-50"
                    >
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem
                      onClick={() => setIsReportModalOpen(true)}
                      className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50"
                    >
                      <Flag size={14} className="mr-2" /> Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-4 sm:px-5 pb-3 mt-3">
          {mode === "feed" ? (
            <Link href={postHref} className="block group">
              <h3 className="text-[22px] sm:text-[24px] font-semibold tracking-tight text-slate-950 leading-[1.2] mb-2.5 group-hover:text-[#1d9bf0] transition-colors">
                {post.title}
              </h3>
            </Link>
          ) : (
            <h1 className="text-[24px] sm:text-[32px] font-semibold tracking-tight text-slate-950 leading-[1.15] mb-2.5">
              {post.title}
            </h1>
          )}

          <p className="text-[15px] sm:text-[16px] text-slate-700 whitespace-pre-wrap leading-7">
            {post.description}
          </p>


          {/* {mode === "feed" && (
            <div className="mt-3">
              <Link
                href={postHref}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#1d9bf0] hover:underline underline-offset-2"
              >
                View full post <ExternalLink size={14} />
              </Link>
            </div>
          )} */}


          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1d9bf0]/10 text-[#1d9bf0]">
                  <Tag size={16} />
                </div>
                <p className="text-[14px] font-semibold tracking-tight text-slate-900">
                  Post details
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200/80">
              <InfoRow
                icon={<MapPin size={16} />}
                label="Location"
                value={
                  <span className="font-medium text-slate-800 break-words">
                    {post.city} — {post.locationDetails}
                  </span>
                }
                action={
                  hasCoordinates ? (
                    <button
                      onClick={() => setShowMap((prev) => !prev)}
                      className="text-[12px] font-bold text-[#1d9bf0] hover:underline underline-offset-2"
                    >
                      {showMap ? "Hide Map" : "View Map"}
                    </button>
                  ) : null
                }
              />
              <InfoRow
                icon={<CalendarDays size={16} />}
                label="Date"
                value={
                  <span className="font-medium text-slate-800">
                    {lostFoundDateLabel}
                  </span>
                }
              />
              {post.contactInfo && (
                <InfoRow
                  icon={<Phone size={16} />}
                  label="Contact"
                  value={
                    <span className="font-semibold text-slate-900 break-all">
                      {post.contactInfo}
                    </span>
                  }
                />
              )}
              {rewardAmount > 0 && (
                <InfoRow
                  icon={<Gift size={16} />}
                  label="Reward"
                  value={
                    <span className="font-bold text-emerald-600">
                      {rewardAmount.toLocaleString()} MMK
                    </span>
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Map ── */}
        {showMap && hasCoordinates && (
          <div className="px-4 sm:px-5 mb-4 animate-in fade-in duration-200">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <MapDisplay
                lat={post.latitude}
                lon={post.longitude}
                name={post.locationDetails}
              />
            </div>
          </div>
        )}

        {/* ── Images ── */}
        {post.images && post.images.length > 0 && (
          <div className="px-4 sm:px-5 mb-2">
            <div
              className={`relative mx-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-[4/3] sm:aspect-[16/10] max-w-full group ${mode === "feed" ? "cursor-pointer" : ""
                }`}
              onClick={() => {
                if (mode === "feed") {
                  router.push(postHref);
                } else {
                  setIsFullscreen(true);
                }
              }}
            >
              {post.images.map(
                (img: { id?: number | string; url: string }, index: number) => (
                  <div
                    key={img.id || index}
                    className={`absolute inset-0 transition-opacity duration-300 ${index === activeImageIndex
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0 pointer-events-none"
                      }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Post image ${index + 1}`}
                      fill
                      className="object-cover hover:scale-[1.01] transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 92vw, 720px"
                      priority={index === 0}
                    />
                  </div>
                ),
              )}

              {post.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full w-10 h-10 p-0 bg-white/85 text-slate-900 hover:bg-white shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    disabled={activeImageIndex === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full w-10 h-10 p-0 bg-white/85 text-slate-900 hover:bg-white shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    disabled={activeImageIndex === post.images.length - 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="absolute bottom-3 right-3 z-20 bg-slate-900/70 text-white px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide shadow-sm backdrop-blur-sm pointer-events-none">
                    {activeImageIndex + 1} / {post.images.length}
                  </div>
                </>
              )}
            </div>

            {mode === "detail" && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#1d9bf0] hover:underline underline-offset-2"
              >
                Open full screen <ExternalLink size={14} />
              </button>
            )}
          </div>
        )}

        {/* ── Action bar ── */}
        <div className="px-3 py-1.5 flex items-center justify-between mt-1">
          <div className="flex items-center justify-around sm:justify-start sm:gap-6 flex-1 sm:flex-none">
            {/* Help / Like */}
            <button
              onClick={() => {
                if (!currentUser) return toast.warning("Please log in to support posts.");
                toggleLike(post.id);
              }}
              disabled={isLiking}
              className={`flex items-center gap-2 font-medium text-[14px] transition-colors rounded-full px-4 py-2 group ${post.liked
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <HandHelping
                size={18}
                className={`group-hover:-translate-y-0.5 transition-transform ${post.liked ? "text-blue-600" : ""}`}
              />
              <span className="hidden sm:inline-block">Help</span>{" "}
              {Number(post.likeCount ?? post.LikeCount ?? 0) > 0
                ? `(${post.likeCount ?? post.LikeCount})`
                : ""}
            </button>

            {/* Comment */}
            <button
              className={`flex items-center gap-2 font-medium text-[14px] transition-colors rounded-full px-4 py-2 group ${showComments
                ? "text-slate-800 bg-slate-100"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle
                size={18}
                className="group-hover:-translate-y-0.5 transition-transform"
              />
              <span className="hidden sm:inline-block">Comment</span>{" "}
              {Number(post.commentCount ?? 0) > 0 ? `(${post.commentCount})` : ""}
            </button>

            {/* ── Share dropdown with social options ── */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-slate-500 font-medium text-[14px] hover:text-slate-800 hover:bg-slate-100 transition-colors rounded-full px-4 py-2 group outline-none">
                <Share2
                  size={18}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />
                <span className="hidden sm:inline-block">Share</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 rounded-xl border-slate-100 shadow-md p-1"
              >
                <DropdownMenuItem
                  onClick={handleShareFacebook}
                  className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50 gap-2.5"
                >
                  <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-[#1877f2] shrink-0" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleShareTwitter}
                  className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50 gap-2.5"
                >
                  <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] fill-[#000000] shrink-0" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter / X
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleShareWhatsApp}
                  className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50 gap-2.5"
                >
                  {/* WhatsApp icon via inline SVG — not in lucide */}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-[15px] h-[15px] fill-[#25d366] shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleShareTelegram}
                  className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50 gap-2.5"
                >
                  <Send size={15} className="text-[#229ed9] shrink-0" />
                  Telegram
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem
                  onClick={handleCopyLink}
                  className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50 gap-2.5"
                >
                  <Copy size={15} className="text-slate-500 shrink-0" />
                  Copy link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bookmark */}
          <button
            onClick={() => {
              if (!currentUser) return toast.warning("Please log in to save posts.");
              toggleBookmark(post.id);
            }}
            disabled={isTogglingBookmark}
            className={`flex items-center gap-2 font-medium text-[14px] transition-colors rounded-full p-2 sm:px-4 sm:py-2 group ${post.bookmarked
              ? "text-[#1d9bf0]"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Bookmark
              size={18}
              className={`group-hover:-translate-y-0.5 transition-transform ${post.bookmarked ? "fill-[#1d9bf0]" : ""
                }`}
            />
            <span className="hidden sm:inline-block">
              {post.bookmarked ? "Saved" : "Save"}
            </span>
          </button>
        </div>

        {/* ── Comments ── */}
        {showComments && (
          <div className="flex flex-col w-full border-t border-slate-100">
            <div className="max-h-[28rem] overflow-y-auto block pr-2 px-4 sm:px-5 pt-2">
              {isLoadingComments ? (
                <p className="text-center text-[13px] text-slate-400 py-6 font-medium">
                  Loading comments...
                </p>
              ) : comments?.length === 0 ? (
                <p className="text-center text-[13px] text-slate-400 py-6 font-medium">
                  No comments yet. Be the first to reply!
                </p>
              ) : (
                <div className="flex flex-col">
                  {displayedComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      postId={post.id}
                      currentUser={currentUser}
                    />
                  ))}
                  {hasMoreComments && (
                    <button
                      onClick={() => setVisibleCommentsCount((prev) => prev + 5)}
                      className="w-fit text-left py-2 px-1 text-[13px] font-bold text-[#1d9bf0] hover:underline underline-offset-2 transition-colors mt-2 mb-3"
                    >
                      Show more comments
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-white mt-auto">
              <CommentInput
                value={newComment}
                onChange={setNewComment}
                onSubmit={submitPostComment}
                isLoading={isAddingComment}
                avatarUrl={currentUser?.avatarUrl}
                placeholder="Add a comment..."
              />
            </div>
          </div>
        )}
      </article>

      {/* ── Fullscreen viewer ── */}
      {isFullscreen && post.images && post.images.length > 0 && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center backdrop-blur-md"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white p-2 z-[100000] transition-colors rounded-full hover:bg-white/10"
            aria-label="Close fullscreen image viewer"
          >
            <X size={28} />
          </button>

          {post.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              disabled={activeImageIndex === 0}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-0 p-3 sm:p-4 z-[100000] transition-colors rounded-full hover:bg-white/10"
              aria-label="Previous image"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {post.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              disabled={activeImageIndex === post.images.length - 1}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-0 p-3 sm:p-4 z-[100000] transition-colors rounded-full hover:bg-white/10"
              aria-label="Next image"
            >
              <ChevronRight size={36} />
            </button>
          )}

          <div
            className="relative w-full h-full max-h-[90vh] max-w-6xl mx-auto flex items-center justify-center p-4 sm:p-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={post.images[activeImageIndex].url}
              alt={`Fullscreen post image ${activeImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {post.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-medium tracking-wide bg-black/50 px-4 py-1.5 rounded-full text-sm">
              {activeImageIndex + 1} / {post.images.length}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {isEditModalOpen && (
        <PostFormModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          postToEdit={post}
        />
      )}

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeletePost}
        entityLabel="post"
        itemName={post.title}
      />

      <ReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        targetType="POST"
        targetId={post.id}
      />
    </>
  );
}