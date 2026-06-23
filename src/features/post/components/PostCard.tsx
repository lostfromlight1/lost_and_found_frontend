"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  MessageCircle,
  ThumbsUp,
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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

const MapDisplay = dynamic(() => import("@/components/map/MapDisplay"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-[16px] border border-[#bfd0c3] bg-[#edf5eb] text-sm text-[#5f756d]">
      Loading map...
    </div>
  ),
});

const safeDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return new Date();
  if (dateStr.length === 10) return new Date(`${dateStr}T00:00:00`);
  return new Date(dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`);
};

export default function PostCard({ post }: { post: PostResponseDto }) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);

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

  const submitPostComment = () => {
    if (!newComment.trim()) return;
    addComment(
      { postId: post.id, content: newComment.trim() },
      { onSuccess: () => setNewComment("") },
    );
  };

  const confirmDeletePost = () => {
    deletePost(post.id, {
      onSuccess: () => setIsDeleteDialogOpen(false),
      onError: () => {
        toast.error("Failed to delete post");
        setIsDeleteDialogOpen(false);
      },
    });
  };

  const nextImage = useCallback(() => {
    setActiveImageIndex((prev) =>
      Math.min(prev + 1, (post.images?.length || 1) - 1),
    );
  }, [post.images?.length]);

  const prevImage = useCallback(() => {
    setActiveImageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen || !post.images) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, post.images, nextImage, prevImage]);

  const isLost = post.type?.toUpperCase() === "LOST";

  const statusChipClass =
    post.status?.toUpperCase() === "OPEN"
      ? "bg-[#e8f1e8] text-[#45624c] border-[#c6d7c4]"
      : "bg-[#eef3ee] text-[#6b7f74] border-[#d4ddd5]";

  const typeChipClass = isLost
    ? "bg-[#f4dfda] text-[#8a4b43] border-[#e3c4bd]"
    : "bg-[#dde9dc] text-[#45624c] border-[#c6d7c4]";

  const metaChipClass = "bg-[#edf5eb] text-[#5f756d] border-[#c9d8cb]";

  const displayedComments = comments?.slice(0, visibleCommentsCount) || [];
  const hasMoreComments = (comments?.length || 0) > visibleCommentsCount;

  const likeCount = Number(post.likeCount ?? post.LikeCount ?? 0);
  const commentCount = Number(post.commentCount ?? 0);

  return (
    <>
      <article
        className="
          relative w-full overflow-hidden rounded-[20px] border
          border-[#b7cfb2] bg-[#f4f8f4] text-[#2f4038]
          shadow-[0_10px_30px_rgba(42,63,63,0.07),inset_0_1px_0_rgba(255,255,255,0.45)]
          transition-all duration-200 ease-out
          hover:shadow-[0_14px_36px_rgba(42,63,63,0.09),inset_0_1px_0_rgba(255,255,255,0.5)]
        "
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(137,192,126,0.04))]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-6 w-24 -translate-x-1/2 rounded-b-[14px] bg-white/35 backdrop-blur-sm" />

        <div className="relative px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-11 w-11 shrink-0 sm:h-12 sm:w-12">
                <Avatar className="h-full w-full rounded-full border border-[#bfd0c3] bg-[#deebe0] shadow-sm">
                  <AvatarImage
                    src={post.user?.avatarUrl || undefined}
                    alt={post.user?.displayName}
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="bg-[#deebe0] font-semibold text-[#45624c]">
                    {post.user?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold leading-tight text-[#24352f]">
                  {post.user?.displayName || "Unknown User"}
                </div>
                <div className="mt-1 text-[12px] font-medium text-[#6b7f74]">
                  {format(safeDate(post.createdAt), "MMM d, yyyy · h:mm a")}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="hidden flex-wrap items-center gap-2 sm:flex">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${statusChipClass}`}
                >
                  {post.status || "OPEN"}
                </span>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${typeChipClass}`}
                >
                  {post.type}
                </span>

                {post.category?.name && (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${metaChipClass}`}
                  >
                    {post.category.name}
                  </span>
                )}
              </div>

              {currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-center rounded-full border border-[#bfd0c3] bg-[#edf5eb] p-2 text-[#5f756d] outline-none transition hover:bg-[#e3eee3] hover:text-[#2a3f3f]">
                    <MoreVertical size={18} />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-44 rounded-2xl border border-[#c7d7ca] bg-[#f9fcf8] p-1 shadow-lg"
                  >
                    {isOwner && (
                      <DropdownMenuItem
                        onClick={() => setIsEditModalOpen(true)}
                        className="cursor-pointer rounded-xl px-3 py-2 font-medium focus:bg-[#e8f1e8]"
                      >
                        <Pencil size={14} className="mr-2" /> Edit Post
                      </DropdownMenuItem>
                    )}

                    {canManage && (
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="cursor-pointer rounded-xl px-3 py-2 font-medium text-red-600 focus:bg-red-50 focus:text-red-600"
                      >
                        <Trash2 size={14} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    )}

                    {!isOwner && (
                      <DropdownMenuItem
                        onClick={() => setIsReportModalOpen(true)}
                        className="cursor-pointer rounded-xl px-3 py-2 font-medium focus:bg-[#e8f1e8]"
                      >
                        <Flag size={14} className="mr-2" /> Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${statusChipClass}`}
            >
              {post.status || "OPEN"}
            </span>

            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${typeChipClass}`}
            >
              {post.type}
            </span>

            {post.category?.name && (
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${metaChipClass}`}
              >
                {post.category.name}
              </span>
            )}
          </div>

          <div className="pb-5 pt-4">
            <h3 className="mb-2 text-[23px] font-extrabold leading-[1.15] tracking-[-0.025em] text-[#24352f] sm:text-[24px]">
              {post.title}
            </h3>

            <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#4e6259]">
              {post.description}
            </p>

            <div className="mt-5 overflow-hidden rounded-[16px] border border-[#c9d8cb] bg-[#edf5eb]">
              <div className="flex flex-col gap-3 p-4">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6c8177] sm:w-28 sm:shrink-0">
                    <MapPin size={15} className="text-[#5f756d]" />
                    Location
                  </div>

                  <span className="flex-1 text-[14px] font-semibold leading-snug text-[#30423b]">
                    {post.city} — {post.locationDetails}
                  </span>

                  {!!post.latitude && !!post.longitude && (
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="mt-1 text-left text-[12px] font-bold text-[#467750] transition hover:text-[#2a3f3f] sm:mt-0 sm:text-right"
                    >
                      {showMap ? "Hide Map" : "View Map"}
                    </button>
                  )}
                </div>

                {(post.contactInfo || (post.reward ?? 0) > 0) && (
                  <div className="grid gap-3">
                    {post.contactInfo && (
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6c8177] sm:w-28 sm:shrink-0">
                          <Phone size={15} className="text-[#5f756d]" />
                          Contact
                        </div>
                        <span className="flex-1 text-[14px] font-semibold text-[#30423b]">
                          {post.contactInfo}
                        </span>
                      </div>
                    )}

                    {(post.reward ?? 0) > 0 && (
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#6c8177] sm:w-28 sm:shrink-0">
                          <Gift size={15} className="text-[#d0a947]" />
                          Reward
                        </div>
                        <span className="flex-1 text-[15px] font-extrabold text-[#467750]">
                          ${post.reward}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showMap && post.latitude && post.longitude && (
          <div className="px-5 pb-5 sm:px-6">
            <div className="overflow-hidden rounded-[16px] border border-[#bfd0c3] shadow-sm animate-in fade-in duration-200">
              <MapDisplay
                lat={post.latitude}
                lon={post.longitude}
                name={post.locationDetails}
              />
            </div>
          </div>
        )}

        {post.images && post.images.length > 0 && (
          <div className="px-5 pb-4 sm:px-6">
            <div className="group relative aspect-square w-full overflow-hidden rounded-[16px] border border-[#bfd0c3] bg-[#deebe0] shadow-sm sm:aspect-video">
              {post.images.map(
                (img: { id?: number | string; url: string }, index: number) => (
                  <div
                    key={img.id || index}
                    onClick={() => setIsFullscreen(true)}
                    className={`absolute inset-0 cursor-pointer transition-opacity duration-300 ${index === activeImageIndex
                      ? "z-10 opacity-100"
                      : "pointer-events-none z-0 opacity-0"
                      }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Post image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority={index === 0}
                    />
                  </div>
                ),
              )}

              {post.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    className="absolute left-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border border-[#bfd0c3] bg-[#f9fcf8]/90 p-0 text-[#45624c] shadow-sm opacity-100 transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    disabled={activeImageIndex === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    className="absolute right-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border border-[#bfd0c3] bg-[#f9fcf8]/90 p-0 text-[#45624c] shadow-sm opacity-100 transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    disabled={activeImageIndex === post.images.length - 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  <div className="absolute bottom-3 right-3 z-20 rounded-full border border-[#bfd0c3] bg-[#f9fcf8]/90 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#5f756d] shadow-sm">
                    {activeImageIndex + 1} / {post.images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="px-4 pb-4 pt-1 sm:px-5">
          <div className="flex items-center justify-between gap-2 rounded-[16px] border border-[#c9d8cb] bg-[#edf5eb] px-2 py-1.5">
            <div className="flex min-w-0 flex-1 items-center justify-around sm:justify-start sm:gap-2">
              <button
                onClick={() => {
                  if (!currentUser)
                    return toast.warning("Please log in to like posts.");
                  toggleLike(post.id);
                }}
                disabled={isLiking}
                className={`group flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${post.liked
                  ? "bg-[#dcead8] text-[#2a3f3f]"
                  : "text-[#5f756d] hover:bg-[#deebe0] hover:text-[#2a3f3f]"
                  }`}
              >
                <ThumbsUp
                  size={18}
                  className={`transition-transform group-hover:-translate-y-0.5 ${post.liked ? "fill-current" : ""
                    }`}
                />
                <span className="hidden sm:inline-block">Like</span>
                {likeCount > 0 ? `(${likeCount})` : ""}
              </button>

              <button
                className={`group flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-bold transition ${showComments
                  ? "bg-[#dcead8] text-[#2a3f3f]"
                  : "text-[#5f756d] hover:bg-[#deebe0] hover:text-[#2a3f3f]"
                  }`}
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle
                  size={18}
                  className="transition-transform group-hover:-translate-y-0.5"
                />
                <span className="hidden sm:inline-block">Comment</span>
                {commentCount > 0 ? `(${commentCount})` : ""}
              </button>

              <button className="group flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-bold text-[#5f756d] transition hover:bg-[#deebe0] hover:text-[#2a3f3f]">
                <Share2
                  size={18}
                  className="transition-transform group-hover:-translate-y-0.5"
                />
                <span className="hidden sm:inline-block">Share</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (!currentUser)
                  return toast.warning("Please log in to save posts.");
                toggleBookmark(post.id);
              }}
              disabled={isTogglingBookmark}
              className={`group flex items-center gap-2 rounded-full p-2 text-[14px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2 ${post.bookmarked
                ? "bg-[#dcead8] text-[#2a3f3f]"
                : "text-[#5f756d] hover:bg-[#deebe0] hover:text-[#2a3f3f]"
                }`}
            >
              <Bookmark
                size={18}
                className={`transition-transform group-hover:-translate-y-0.5 ${post.bookmarked ? "fill-current" : ""
                  }`}
              />
              <span className="hidden sm:inline-block">
                {post.bookmarked ? "Saved" : "Save"}
              </span>
            </button>
          </div>
        </div>

        {showComments && (
          <div className="border-t border-[#c9d8cb] bg-[#edf5eb]/85">
            <div className="max-h-100 overflow-y-auto px-5 pb-2 pt-3 sm:px-6">
              {isLoadingComments ? (
                <p className="py-6 text-center text-[13px] font-medium text-[#6b7f74]">
                  Loading comments...
                </p>
              ) : comments?.length === 0 ? (
                <p className="py-6 text-center text-[13px] font-medium text-[#6b7f74]">
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
                      onClick={() =>
                        setVisibleCommentsCount((prev) => prev + 5)
                      }
                      className="mb-3 mt-2 w-fit px-1 py-2 text-left text-[13px] font-bold text-[#467750] transition hover:text-[#2a3f3f]"
                    >
                      Show more comments
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-[#c9d8cb] bg-[#f7fbf7] px-5 py-4 sm:px-6">
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

      {isFullscreen && post.images && post.images.length > 0 && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/92 backdrop-blur-md"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 z-[100000] rounded-full bg-white/10 p-2 text-white/75 transition hover:bg-white/15 hover:text-white sm:right-6 sm:top-6"
          >
            <X size={28} />
          </button>

          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              disabled={activeImageIndex === 0}
              className="absolute left-2 top-1/2 z-[100000] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/75 transition hover:bg-white/15 hover:text-white disabled:opacity-0 sm:left-6 sm:p-4"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              disabled={activeImageIndex === post.images.length - 1}
              className="absolute right-2 top-1/2 z-[100000] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white/75 transition hover:bg-white/15 hover:text-white disabled:opacity-0 sm:right-6 sm:p-4"
            >
              <ChevronRight size={36} />
            </button>
          )}

          <div
            className="relative mx-auto flex h-full max-h-[90vh] w-full max-w-6xl items-center justify-center p-4 sm:p-16"
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
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm font-medium tracking-wide text-white/75">
              {activeImageIndex + 1} / {post.images.length}
            </div>
          )}
        </div>
      )}

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