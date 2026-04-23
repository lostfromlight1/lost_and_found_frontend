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
  useToggleBookmarkPost, // <--- ADDED
} from "@/features/post/hooks/usePosts";
import PostFormModal from "@/features/post/components/PostFormModal";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import CommentInput from "@/features/comments/components/CommentInput";
import ReportModal from "@/features/reports/components/ReportModal";
import CommentCard, { CurrentUser } from "@/features/comments/components/CommentCard";
import { Button } from "@/components/ui/button";

const MapDisplay = dynamic(() => import("@/components/map/MapDisplay"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-slate-50 animate-pulse border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
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
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmarkPost(); // <--- ADDED

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
    return () => { document.body.style.overflow = "unset"; };
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
  const typeStyles = isLost
    ? "bg-red-50 text-red-600 border-red-100"
    : "bg-emerald-50 text-emerald-600 border-emerald-100";

  const displayedComments = comments?.slice(0, visibleCommentsCount) || [];
  const hasMoreComments = (comments?.length || 0) > visibleCommentsCount;

  return (
    <>
      <article className="w-full bg-white overflow-hidden hover:bg-slate-50/20 transition-colors pt-3">
        <div className="px-4 sm:px-5 flex flex-row items-start justify-between">
          <div className="flex gap-3 sm:gap-4 items-center">
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
              <span className="font-semibold text-[15px] text-slate-900 leading-tight">
                {post.user?.displayName || "Unknown User"}
              </span>
              <span className="text-[13px] text-slate-500 leading-tight mt-1">
                {format(safeDate(post.createdAt), "MMM d, yyyy · h:mm a")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 text-[11px] font-semibold border uppercase tracking-wider rounded-full ${
                post.status?.toUpperCase() === "OPEN"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {post.status || "OPEN"}
            </span>

            <span className={`px-2.5 py-0.5 text-[11px] font-semibold border uppercase tracking-wider rounded-full ${typeStyles}`}>
              {post.type}
            </span>

            <span className="px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 uppercase tracking-wider rounded-full hidden sm:inline-block">
              {post.category?.name}
            </span>

            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 ml-1 transition-colors outline-none rounded-full flex items-center justify-center">
                  <MoreVertical size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-100 shadow-md p-1">
                  {isOwner && (
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50">
                      <Pencil size={14} className="mr-2" /> Edit Post
                    </DropdownMenuItem>
                  )}
                  {canManage && (
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg font-medium py-2 px-3 focus:bg-red-50">
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50">
                      <Flag size={14} className="mr-2" /> Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-5 pb-3 mt-3">
          <h3 className="font-semibold text-xl mb-2 text-slate-900 leading-snug">
            {post.title}
          </h3>
          <p className="text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed">
            {post.description}
          </p>

          <div className="my-4 bg-slate-50 border border-slate-200">
            {/* Top Row: Location */}
            <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-widest shrink-0 sm:w-28">
                <MapPin size={16} className="text-[#1d9bf0]" /> Location
              </div>
              <span className="flex-1 text-[14px] font-medium text-slate-800 leading-snug">
                {post.city} — {post.locationDetails}
              </span>
              {!!post.latitude && !!post.longitude && (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="mt-1 sm:mt-0 text-[12px] font-bold text-[#1d9bf0] hover:underline shrink-0 sm:text-right"
                >
                  {showMap ? "Hide Map" : "View Map"}
                </button>
              )}
            </div>

            {/* Bottom Rows: Contact & Reward (Conditional) */}
            {(post.contactInfo || (post.reward ?? 0) > 0) && (
              <div className="flex flex-col pb-3 sm:pb-4 gap-3 sm:gap-4">
                {post.contactInfo && (
                  <div className="px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-widest shrink-0 sm:w-28">
                      <Phone size={16} className="text-[#1d9bf0]" /> Contact
                    </div>
                    <span className="flex-1 text-[14px] font-semibold text-slate-900">{post.contactInfo}</span>
                  </div>
                )}
                {(post.reward ?? 0) > 0 && (
                  <div className="px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-widest shrink-0 sm:w-28">
                      <Gift size={16} className="text-emerald-500" /> Reward
                    </div>
                    <span className="flex-1 text-[14px] font-bold text-emerald-600">${post.reward}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showMap && post.latitude && post.longitude && (
          <div className="mb-4 rounded-none overflow-hidden border-y border-slate-100 animate-in fade-in duration-200">
            <MapDisplay lat={post.latitude} lon={post.longitude} name={post.locationDetails} />
          </div>
        )}

        {post.images && post.images.length > 0 && (
          <div className="relative w-full aspect-square sm:aspect-video border-y border-slate-100 bg-slate-100 overflow-hidden group mb-2">
            {post.images.map((img: { id?: number | string; url: string }, index: number) => (
              <div
                key={img.id || index}
                onClick={() => setIsFullscreen(true)}
                className={`absolute inset-0 cursor-pointer transition-opacity duration-300 ${index === activeImageIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
              >
                <Image
                  src={img.url}
                  alt={`Post image ${index + 1}`}
                  fill
                  className="object-cover hover:scale-[1.01] transition-transform duration-500"
                  sizes="(max-w-768px) 100vw, 800px"
                  priority={index === 0}
                />
              </div>
            ))}
            {post.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full w-10 h-10 p-0 bg-white/80 text-slate-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  disabled={activeImageIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full w-10 h-10 p-0 bg-white/80 text-slate-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
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
        )}
        
        {/* --- UPDATED ACTION BAR WITH BOOKMARK --- */}
        <div className="px-3 py-1.5 flex items-center justify-between mt-1">
          <div className="flex items-center justify-around sm:justify-start sm:gap-6 flex-1 sm:flex-none">
            <button
              onClick={() => {
                if (!currentUser) return toast.warning("Please log in to like posts.");
                toggleLike(post.id);
              }}
              disabled={isLiking}
              className={`flex items-center gap-2 font-medium text-[14px] transition-colors rounded-full px-4 py-2 group ${post.liked ? "text-blue-600" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ThumbsUp size={18} className={`group-hover:-translate-y-0.5 transition-transform ${post.liked ? "fill-blue-600" : ""}`} />
              <span className="hidden sm:inline-block">Like</span> {Number(post.likeCount ?? post.LikeCount ?? 0) > 0 ? `(${post.likeCount ?? post.LikeCount})` : ""}
            </button>
            
            <button
              className={`flex items-center gap-2 font-medium text-[14px] transition-colors rounded-full px-4 py-2 group ${
                showComments ? "text-slate-800 bg-slate-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle size={18} className="group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline-block">Comment</span> {Number(post.commentCount ?? 0) > 0 ? `(${post.commentCount})` : ""}
            </button>
            
            <button className="flex items-center gap-2 text-slate-500 font-medium text-[14px] hover:text-slate-800 hover:bg-slate-100 transition-colors rounded-full px-4 py-2 group">
              <Share2 size={18} className="group-hover:-translate-y-0.5 transition-transform" /> 
              <span className="hidden sm:inline-block">Share</span>
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => {
              if (!currentUser) return toast.warning("Please log in to save posts.");
              toggleBookmark(post.id);
            }}
            disabled={isTogglingBookmark}
            className={`flex items-center gap-2 font-medium text-[14px] transition-colors rounded-full p-2 sm:px-4 sm:py-2 group ${
              post.bookmarked ? "text-[#1d9bf0]" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Bookmark size={18} className={`group-hover:-translate-y-0.5 transition-transform ${post.bookmarked ? "fill-[#1d9bf0]" : ""}`} />
            <span className="hidden sm:inline-block">{post.bookmarked ? "Saved" : "Save"}</span>
          </button>
        </div>

        {showComments && (
          <div className="flex flex-col w-full border-t border-slate-100">
            <div className="max-h-100 overflow-y-auto block pr-2 px-4 sm:px-5 pt-2">
              {isLoadingComments ? (
                <p className="text-center text-[13px] text-slate-400 py-6 font-medium">Loading comments...</p>
              ) : comments?.length === 0 ? (
                <p className="text-center text-[13px] text-slate-400 py-6 font-medium">No comments yet. Be the first to reply!</p>
              ) : (
                <div className="flex flex-col">
                  {displayedComments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} postId={post.id} currentUser={currentUser} />
                  ))}
                  {hasMoreComments && (
                    <button
                      onClick={() => setVisibleCommentsCount((prev) => prev + 5)}
                      className="w-fit text-left py-2 px-1 text-[13px] font-bold text-[#1d9bf0] hover:underline transition-colors mt-2 mb-3"
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

      {/* Lightbox / Fullscreen Image Viewer */}
      {isFullscreen && post.images && post.images.length > 0 && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center backdrop-blur-md" onClick={() => setIsFullscreen(false)}>
          <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white p-2 z-[100000] transition-colors rounded-full hover:bg-white/10">
            <X size={28} />
          </button>
          {post.images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} disabled={activeImageIndex === 0} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-0 p-3 sm:p-4 z-[100000] transition-colors rounded-full hover:bg-white/10">
              <ChevronLeft size={36} />
            </button>
          )}
          {post.images.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} disabled={activeImageIndex === post.images.length - 1} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-0 p-3 sm:p-4 z-[100000] transition-colors rounded-full hover:bg-white/10">
              <ChevronRight size={36} />
            </button>
          )}
          <div className="relative w-full h-full max-h-[90vh] max-w-6xl mx-auto flex items-center justify-center p-4 sm:p-16" onClick={(e) => e.stopPropagation()}>
            <Image src={post.images[activeImageIndex].url} alt={`Fullscreen post image ${activeImageIndex + 1}`} fill className="object-contain" sizes="100vw" priority />
          </div>
          {post.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-medium tracking-wide bg-black/50 px-4 py-1.5 rounded-full text-sm">
              {activeImageIndex + 1} / {post.images.length}
            </div>
          )}
        </div>
      )}

      {isEditModalOpen && <PostFormModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} postToEdit={post} />}
      <DeleteConfirmationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={confirmDeletePost} entityLabel="post" itemName={post.title} />
      <ReportModal open={isReportModalOpen} onOpenChange={setIsReportModalOpen} targetType="POST" targetId={post.id} />
    </>
  );
}
