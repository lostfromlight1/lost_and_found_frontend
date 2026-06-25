"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
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
    HandHelping,
    ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostResponseDto } from "@/features/post/api/response/posts.response";
import { usePostComments, useCreateComment } from "@/features/comments/hooks/useComments";
import { useDeletePost, useToggleLikePost, useToggleBookmarkPost } from "@/features/post/hooks/usePosts";
import PostFormModal from "@/features/post/components/PostFormModal";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import CommentInput from "@/features/comments/components/CommentInput";
import ReportModal from "@/features/reports/components/ReportModal";
import CommentCard, { CurrentUser } from "@/features/comments/components/CommentCard";
import { Button } from "@/components/ui/button";

const MapDisplay = dynamic(() => import("@/components/map/MapDisplay"), {
    ssr: false,
    loading: () => (
        <div className="h-48 w-full rounded-xl bg-slate-100 animate-pulse border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
            Loading map...
        </div>
    ),
});

const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "Unknown date";
    const parsed = dateStr.length === 10 ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`);
    return isValid(parsed) ? format(parsed, "MMM d, yyyy · h:mm a") : "Unknown date";
};

const formatDateOnly = (dateStr?: string | null) => {
    if (!dateStr) return "Not specified";
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? parseISO(dateStr) : new Date(dateStr);
    return isValid(parsed) ? format(parsed, "MMMM d, yyyy") : "Not specified";
};

export default function PostDetailView({ post }: { post: PostResponseDto }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [newComment, setNewComment] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [liked, setLiked] = useState(post.liked);
    const [likeCount, setLikeCount] = useState(post.likeCount ?? post.LikeCount ?? 0);
    const [bookmarked, setBookmarked] = useState(post.bookmarked);

    const { data: comments, isLoading: isLoadingComments } = usePostComments(post.id);
    const { mutate: addComment, isPending: isAddingComment } = useCreateComment();
    const { mutate: deletePost } = useDeletePost();
    const { mutate: toggleLike, isPending: isLiking } = useToggleLikePost();
    const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmarkPost();

    const currentUser = session?.user as CurrentUser | undefined;
    const isOwner = String(currentUser?.id) === String(post.user.id);
    const isAdmin = currentUser?.role === "ADMIN";
    const canManage = isOwner || isAdmin;

    const isLost = post.type?.toUpperCase() === "LOST";

    const nextImage = useCallback(() => {
        setActiveImageIndex((prev) => Math.min(prev + 1, (post.images?.length || 1) - 1));
    }, [post.images?.length]);

    const prevImage = useCallback(() => {
        setActiveImageIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: post.title, text: post.description, url: window.location.href });
                return;
            }
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard");
        } catch {
            toast.error("Unable to share");
        }
    };

    const handleToggleLike = () => {
        if (!currentUser) return toast.warning("Please login");
        const prevLiked = liked;
        const prevCount = likeCount;
        setLiked(!prevLiked);
        setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

        toggleLike(post.id, {
            onSuccess: () => {
                router.refresh();
            },
            onError: () => {
                setLiked(prevLiked);
                setLikeCount(prevCount);
                toast.error("Failed to update");
            },
        });
    };

    const handleToggleBookmark = () => {
        if (!currentUser) return toast.warning("Please login");
        const prevBookmarked = bookmarked;
        setBookmarked(!prevBookmarked);

        toggleBookmark(post.id, {
            onSuccess: () => {
                router.refresh();
            },
            onError: () => {
                setBookmarked(prevBookmarked);
                toast.error("Failed to update");
            },
        });
    };

    return (
        <div className="space-y-6">

            {/* ─── BACK BUTTON LINE ─── */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2 text-slate-600 hover:text-slate-900 -ml-2 rounded-xl"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-semibold">Back</span>
                </Button>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">


                <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col">

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full justify-between space-y-6">

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col space-y-6">
                            {/* Tags & Action Dropdown */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${isLost ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        }`}>
                                        {post.type}
                                    </span>
                                    <span className="px-3 py-1 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider rounded-full">
                                        {post.status || "OPEN"}
                                    </span>
                                    <span className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
                                        {post.category?.name}
                                    </span>
                                </div>

                                {currentUser && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-50 transition-colors">
                                            <MoreVertical size={20} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
                                            {isOwner && (
                                                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer py-2">
                                                    <Pencil size={14} className="mr-2" /> Edit Post
                                                </DropdownMenuItem>
                                            )}
                                            {canManage && (
                                                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="cursor-pointer text-red-600 focus:text-red-600 py-2">
                                                    <Trash2 size={14} className="mr-2" /> Delete
                                                </DropdownMenuItem>
                                            )}
                                            {!isOwner && (
                                                <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} className="cursor-pointer py-2">
                                                    <Flag size={14} className="mr-2" /> Report
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {/* Title & Description */}
                            <div className="space-y-3">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                                    {post.title}
                                </h1>
                                <p className="text-[15px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {post.description}
                                </p>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Reward Panel */}
                            {Boolean(post.reward && post.reward > 0) && (
                                <div className="flex items-center gap-4 bg-emerald-50/80 p-4 rounded-xl border border-emerald-100">
                                    <div className="p-2 bg-emerald-500 rounded-lg text-white">
                                        <Gift size={22} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/80">Reward Offered</p>
                                        <p className="text-xl font-extrabold text-emerald-700">{post.reward?.toLocaleString()} MMK</p>
                                    </div>
                                </div>
                            )}

                            {/* Core Information Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-start gap-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                                    <MapPin className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{post.city} — {post.locationDetails}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                                    <CalendarDays className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date Event</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{formatDateOnly(post.lostFoundDate)}</p>
                                    </div>
                                </div>

                                {post.contactInfo && (
                                    <div className="flex items-start gap-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                                        <Phone className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Number</p>
                                            <a href={`tel:${post.contactInfo}`} className="text-sm font-bold text-blue-600 hover:underline block mt-0.5">
                                                {post.contactInfo}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="space-y-4 pt-4 border-t border-slate-100 mt-auto">
                            {/* Author Profile */}
                            <div className="flex items-center gap-3">
                                <Avatar className="w-11 h-11 border border-slate-200">
                                    <AvatarImage src={post.user?.avatarUrl || undefined} alt={post.user?.displayName} />
                                    <AvatarFallback className="bg-slate-100 text-slate-700 font-medium">
                                        {post.user?.displayName?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900">{post.user?.displayName || "User"}</span>
                                    <span className="text-xs text-slate-400 mt-0.5">Posted {formatDateTime(post.createdAt)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={liked ? "default" : "outline"}
                                    onClick={handleToggleLike}
                                    disabled={isLiking}
                                    className={`rounded-xl gap-2 h-10 ${liked ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    <HandHelping size={16} />
                                    <span className="text-xs font-bold">Help ({likeCount})</span>
                                </Button>

                                <Button variant="outline" onClick={handleShare} className="rounded-xl gap-2 h-10 text-slate-600 hover:bg-slate-50">
                                    <Share2 size={16} />
                                    <span className="text-xs font-bold">Share</span>
                                </Button>

                                <Button
                                    variant={bookmarked ? "secondary" : "outline"}
                                    onClick={handleToggleBookmark}
                                    disabled={isTogglingBookmark}
                                    className={`rounded-xl gap-2 h-10 ${bookmarked ? "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    <Bookmark size={16} className={bookmarked ? "fill-blue-600" : ""} />
                                    <span className="text-xs font-bold">{bookmarked ? "Saved" : "Save"}</span>
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ─── RIGHT SIDEBAR (IMAGE & MAP) ─── */}
                <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col">

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6 flex flex-col h-full justify-between">

                        {/* Image Area */}
                        <div className="space-y-4 flex-1 flex flex-col justify-center">
                            {post.images && post.images.length > 0 ? (
                                <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 aspect-[4/3] sm:aspect-[16/11] group">
                                    <Image
                                        src={post.images[activeImageIndex].url}
                                        alt={post.title}
                                        fill
                                        className="object-contain cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]"
                                        onClick={() => setIsFullscreen(true)}
                                        priority
                                        unoptimized
                                    />
                                    {post.images.length > 1 && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 p-0 bg-white/90 text-slate-800 hover:bg-white shadow backdrop-blur-sm"
                                                onClick={prevImage}
                                                disabled={activeImageIndex === 0}
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 p-0 bg-white/90 text-slate-800 hover:bg-white shadow backdrop-blur-sm"
                                                onClick={nextImage}
                                                disabled={activeImageIndex === post.images.length - 1}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                            <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                                                {activeImageIndex + 1} / {post.images.length}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full aspect-[16/11] bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-dashed border-slate-200">
                                    No Images Provided
                                </div>
                            )}

                            {/* Thumbnail Navigation */}
                            {post.images && post.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none snap-x">
                                    {post.images.map((img, idx) => (
                                        <button
                                            key={img.id || idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all snap-center ${idx === activeImageIndex
                                                ? "border-blue-500 scale-95 shadow-sm"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <Image src={img.url} alt="thumbnail" fill className="object-cover" unoptimized />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Map Area */}
                        {typeof post.latitude === "number" && typeof post.longitude === "number" && (
                            <div className="space-y-3 pt-4 border-t border-slate-100 mt-auto">
                                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 tracking-wide uppercase">
                                    <MapPin size={15} className="text-blue-500" /> Geographic Location
                                </h3>
                                <div className="overflow-hidden rounded-xl border border-slate-200 h-64">
                                    <MapDisplay lat={post.latitude} lon={post.longitude} name={post.locationDetails} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── COMMENTS SECTION ─── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MessageCircle size={20} className="text-blue-500" />
                    Comments ({comments?.length || 0})
                </h3>

                <div className="max-h-[32rem] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                    {isLoadingComments ? (
                        <p className="text-center text-sm text-slate-400 py-6">Loading comments...</p>
                    ) : comments?.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-6">No comments yet. Be the first to reply!</p>
                    ) : (
                        comments?.map((comment) => (
                            <CommentCard key={comment.id} comment={comment} postId={post.id} currentUser={currentUser} />
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <CommentInput
                        value={newComment}
                        onChange={setNewComment}
                        onSubmit={() => {
                            if (!newComment.trim()) return;
                            addComment({ postId: post.id, content: newComment.trim() }, { onSuccess: () => setNewComment("") });
                        }}
                        isLoading={isAddingComment}
                        avatarUrl={currentUser?.avatarUrl}
                        placeholder="Write a supportive comment or update..."
                    />
                </div>
            </div>

            {/* FULLSCREEN IMAGE MODAL */}
            {isFullscreen && post.images && post.images.length > 0 && (
                <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center backdrop-blur-sm" onClick={() => setIsFullscreen(false)}>
                    <button onClick={() => setIsFullscreen(false)} className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                        <X size={28} />
                    </button>
                    <div className="relative w-full h-full max-h-[85vh] max-w-5xl mx-auto p-4" onClick={(e) => e.stopPropagation()}>
                        <Image src={post.images[activeImageIndex].url} alt="Fullscreen" fill className="object-contain" priority unoptimized />
                    </div>
                </div>
            )}

            {/* MODALS & DIALOGS */}
            {isEditModalOpen && <PostFormModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} postToEdit={post} />}
            <DeleteConfirmationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={() => deletePost(post.id, { onSuccess: () => router.push("/") })} entityLabel="post" itemName={post.title} />
            <ReportModal open={isReportModalOpen} onOpenChange={setIsReportModalOpen} targetType="POST" targetId={post.id} />

        </div>
    );
}