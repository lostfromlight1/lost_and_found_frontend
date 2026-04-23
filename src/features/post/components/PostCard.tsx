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
  MoreHorizontal,
  X,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
  calculateTotalCommentCount,
} from "@/features/comments/hooks/useComments";
import {
  useDeletePost,
  useToggleLikePost,
} from "@/features/post/hooks/usePosts";
import PostFormModal from "@/features/post/components/PostFormModal";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import CommentInput from "@/features/comments/components/CommentInput";
import ReportModal from "@/features/reports/components/ReportModal";
import CommentCard, {
  CurrentUser,
} from "@/features/comments/components/CommentCard"; // <-- Imported new CommentCard
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

  // Image Viewer State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);

  const { data: comments, isLoading: isLoadingComments } = usePostComments(
    showComments ? post.id : 0,
  );
  const { mutate: addComment, isPending: isAddingComment } = useCreateComment();
  const { mutate: deletePost } = useDeletePost();
  const { mutate: toggleLike, isPending: isLiking } = useToggleLikePost();

  const currentUser = session?.user as CurrentUser | undefined;
  const isOwner = String(currentUser?.id) === String(post.user.id);
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isOwner || isAdmin;

  const totalComments = calculateTotalCommentCount(comments);

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

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  // Keyboard navigation for Lightbox
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
      <Card className="w-full shadow-sm border border-slate-200 bg-white rounded-none sm:rounded-none mb-6 overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-row items-start justify-between">
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
  {/* 1. Post Status Badge (Add this here) */}
  <span
    className={`px-2.5 py-0.5 text-[11px] font-semibold border uppercase tracking-wider rounded-full ${
      post.status?.toUpperCase() === "OPEN"
        ? "bg-blue-50 text-blue-600 border-blue-100"
        : "bg-slate-100 text-slate-600 border-slate-200"
    }`}
  >
    {post.status || "OPEN"}
  </span>

  {/* 2. Type Badge (Lost/Found) */}
  <span
    className={`px-2.5 py-0.5 text-[11px] font-semibold border uppercase tracking-wider rounded-full ${typeStyles}`}
  >
    {post.type}
  </span>

  {/* 3. Category Badge (Hidden on mobile) */}
  <span className="px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 uppercase tracking-wider rounded-full hidden sm:inline-block">
    {post.category?.name}
  </span>

            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 hover:bg-slate-50 p-1.5 ml-1 transition-colors outline-none rounded-full flex items-center justify-center">
                  {/* Change this line below */}
                  <MoreVertical size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 rounded-xl border-slate-100 shadow-md p-1"
                >
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

        <div className="px-4 sm:px-5 pb-2">
          <h3 className="font-semibold text-xl mb-2 text-slate-900 leading-snug">
            {post.title}
          </h3>
          <p className="text-[15px] text-slate-800 whitespace-pre-wrap mb-4 leading-relaxed">
            {post.description}
          </p>

         <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
  <span className="font-medium text-slate-500 shrink-0 w-16">
    Location
  </span>
  <span className="flex-1 text-slate-900">
    {post.city} - {post.locationDetails}
  </span>

  {/* Use !! to ensure 0 values are treated as false and not rendered */}
  {!!post.latitude && !!post.longitude && (
    <button
      onClick={() => setShowMap(!showMap)}
      className="mt-1 sm:mt-0 font-medium text-xs text-slate-900 hover:text-slate-700 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors shrink-0 inline-flex items-center gap-1"
    >
      <MapPin size={14} /> {showMap ? "Hide Map" : "View Map"}
    </button>
  )}
</div>  

            {post.contactInfo && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-slate-500 shrink-0 w-16">
                  Contact
                </span>
                <span className="text-slate-900">{post.contactInfo}</span>
              </div>
            )}

            {(post.reward ?? 0) > 0 && (
              <div className="flex items-start gap-2 pt-3 border-t border-slate-100 mt-1">
                <span className="font-medium text-slate-500 shrink-0 w-16">
                  Reward
                </span>
                <span className="font-semibold text-emerald-600">
                  ${post.reward}
                </span>
              </div>
            )}
          </div>

          {showMap && post.latitude && post.longitude && (
            <div className="mb-4 rounded-none overflow-hidden border border-slate-100 animate-in fade-in duration-200">
              <MapDisplay
                lat={post.latitude}
                lon={post.longitude}
                name={post.locationDetails}
              />
            </div>
          )}

          {post.images && post.images.length > 0 && (
            <div className="relative w-full aspect-square sm:aspect-video border border-slate-100 bg-slate-100 rounded-none overflow-hidden group mb-4">
              {post.images.map(
                (img: { id?: number | string; url: string }, index: number) => (
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
                ),
              )}

              {post.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full w-10 h-10 p-0 bg-white/80 text-slate-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full w-10 h-10 p-0 bg-white/80 text-slate-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
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
        

        <div className="px-2 py-1.5 border-t border-slate-100 flex items-center justify-around sm:justify-start sm:gap-6">
          <button
            onClick={() => {
              if (!currentUser)
                return toast.warning("Please log in to like posts.");
              toggleLike(post.id);
            }}
            disabled={isLiking}
            className={`flex items-center gap-2 font-medium text-[14px] transition-colors rounded-full px-4 py-2 group ${post.liked ? "text-blue-600" : "text-slate-500 hover:text-slate-800"} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsUp
              size={18}
              className={`group-hover:-translate-y-0.5 transition-transform ${post.liked ? "fill-blue-600" : ""}`}
            />
            Like {post.LikeCount > 0 ? `(${post.LikeCount})` : ""}
          </button>
          <button
            className={`flex items-center gap-2 font-medium text-[14px] transition-colors rounded-full px-4 py-2 group ${
              showComments
                ? "text-slate-800 bg-slate-50"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle
              size={18}
              className="group-hover:-translate-y-0.5 transition-transform"
            />

            {/* Change totalComments to post.commentCount (or the correct property name from your DTO) */}
            <span>Comment ({post.LikeCount ?? 0})</span>
          </button>
          <button className="flex items-center gap-2 text-slate-500 font-medium text-[14px] hover:text-slate-800 transition-colors rounded-full px-4 py-2 group">
            <Share2
              size={18}
              className="group-hover:-translate-y-0.5 transition-transform"
            />{" "}
            Share
          </button>
        </div>

        {showComments && (
          <div className="flex flex-col w-full bg-slate-50/20 border-t border-slate-100">
            <div className="max-h-100 overflow-y-auto block pr-2 px-4 sm:px-5 pt-4">
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
                  {/* Replaced with the new decoupled CommentCard */}
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
                      className="w-fit text-left py-2 px-1 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
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
      </Card>

      {/* Lightbox / Fullscreen Image Viewer */}
      {isFullscreen && post.images && post.images.length > 0 && (
        <div
          className="fixed inset-0 z-99999 bg-black/95 flex items-center justify-center backdrop-blur-md"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white p-2 z-100000 transition-colors rounded-full hover:bg-white/10"
          >
            <X size={28} />
          </button>

          {/* Navigation - Left */}
          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              disabled={activeImageIndex === 0}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-0 p-3 sm:p-4 z-100000 transition-colors rounded-full hover:bg-white/10"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Navigation - Right */}
          {post.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              disabled={activeImageIndex === post.images.length - 1}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-0 p-3 sm:p-4 z-100000 transition-colors rounded-full hover:bg-white/10"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative w-full h-full max-h-[90vh] max-w-6xl mx-auto flex items-center justify-center p-4 sm:p-16"
            onClick={(e) => e.stopPropagation()} // Prevent clicks on image from closing lightbox
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

          {/* Counter */}
          {post.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-medium tracking-wide bg-black/50 px-4 py-1.5 rounded-full text-sm">
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
