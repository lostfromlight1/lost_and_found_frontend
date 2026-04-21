"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { MessageCircle, MapPin, Gift, Phone, CornerDownRight, MoreVertical, ThumbsUp, Share2, Pencil, Trash2, Flag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PostResponseDto } from "../api/response/posts.response";
import { CommentResponse } from "@/features/comments/api/response/comments.response";
import { usePostComments, useCreateComment, useCreateReply } from "@/features/comments/hooks/useComments";
import { useDeletePost } from "../hooks/usePosts";
import PostFormModal from "./PostFormModal";

// Dynamically import the map so it only loads on the client side
const MapDisplay = dynamic(() => import("@/components/map/MapDisplay"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm border border-slate-200">
      Loading map...
    </div>
  ),
});

// --- SUB-COMPONENT: Single Comment Thread ---
const CommentThread = ({ comment, postId }: { comment: CommentResponse, postId: number }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ id?: number, name?: string }>({});
  
  const { mutate: addReply, isPending: isAddingReply } = useCreateReply(postId);

  const handleReplySubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    addReply({ commentId: comment.id, content: replyContent.trim(), replyToId: replyTarget.id }, {
      onSuccess: () => { setReplyContent(""); setIsReplying(false); setReplyTarget({}); }
    });
  };

  const openReply = (targetId?: number, targetName?: string) => {
    setReplyTarget({ id: targetId, name: targetName });
    setIsReplying(true);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2 w-full">
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={comment.authorAvatarUrl || undefined} />
          <AvatarFallback className="bg-slate-200 text-xs">{comment.authorName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col w-full">
          <div className="bg-slate-100 px-3 py-2 rounded-2xl rounded-tl-none w-fit max-w-full">
            <p className="text-xs font-semibold">{comment.authorName}</p>
            <p className="text-sm text-slate-800 wrap-break-word">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 px-2 mt-1 text-[11px] text-slate-500 font-medium">
            <span>{format(new Date(comment.createdAt), "MMM d, h:mm a")}</span>
            <button type="button" className="hover:text-slate-800 hover:underline" onClick={() => openReply()}>Reply</button>
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-10 flex flex-col gap-3 mt-1">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2 w-full">
               <Avatar className="w-6 h-6 mt-1">
                <AvatarImage src={reply.authorAvatarUrl || undefined} />
                <AvatarFallback className="bg-slate-200 text-[10px]">{reply.authorName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col w-full">
                <div className="bg-slate-50 px-3 py-2 rounded-2xl rounded-tl-none w-fit max-w-full border border-slate-100">
                  <p className="text-xs font-semibold">
                    {reply.authorName} {reply.replyToAuthorName && <span className="text-slate-400 font-normal ml-1">▶ {reply.replyToAuthorName}</span>}
                  </p>
                  <p className="text-sm text-slate-800 wrap-break-word">{reply.content}</p>
                </div>
                <div className="flex items-center gap-3 px-2 mt-1 text-[10px] text-slate-500 font-medium">
                  <button type="button" className="hover:text-slate-800 hover:underline" onClick={() => openReply(reply.id, reply.authorName)}>Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isReplying && (
        <form onSubmit={handleReplySubmit} className="flex gap-2 pl-10 mt-2 items-center">
           <CornerDownRight size={14} className="text-slate-300" />
           <Input autoFocus placeholder={replyTarget.name ? `Reply to ${replyTarget.name}...` : "Write a reply..."} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="flex-1 rounded-full h-8 text-xs bg-slate-50 focus-visible:ring-1" disabled={isAddingReply} />
           <Button type="submit" size="sm" className="rounded-full px-3 h-8 text-xs" disabled={!replyContent.trim() || isAddingReply}>Send</Button>
           <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-slate-400" onClick={() => setIsReplying(false)}>Cancel</Button>
        </form>
      )}
    </div>
  );
};

// --- MAIN POST CARD COMPONENT ---
export default function PostCard({ post }: { post: PostResponseDto }) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: comments, isLoading: isLoadingComments } = usePostComments(showComments ? post.id : 0);
  const { mutate: addComment, isPending: isAddingComment } = useCreateComment();
  const { mutate: deletePost } = useDeletePost();

  const currentUser = session?.user;
  const isOwner = String(currentUser?.id) === String(post.user.id);
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isOwner || isAdmin;

  const handleAddComment = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment({ postId: post.id, content: newComment.trim() }, { onSuccess: () => setNewComment("") });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) deletePost(post.id);
  };

  const isLost = post.type === "LOST";

  return (
    <>
      <Card className="w-full shadow-sm border-slate-200 bg-white overflow-hidden rounded-xl">
        
        {/* HEADER */}
        <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={post.user?.avatarUrl || undefined} alt={post.user?.displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {post.user?.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-900">{post.user?.displayName || "Unknown User"}</span>
              <span className="text-xs text-slate-500 font-medium">{format(new Date(post.lostFoundDate), "MMM d, yyyy")}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500">Category: <span className="text-slate-800">{post.category?.name}</span></p>
              <span className={`inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {post.type}
              </span>
            </div>
            
            {/* 3-Dot Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 -mr-2 transition-colors outline-none">
                <MoreVertical size={18} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                {isOwner && (
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer">
                    <Pencil size={14} className="mr-2" /> Update
                  </DropdownMenuItem>
                )}
                {canManage && (
                  <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600 focus:text-red-600">
                    <Trash2 size={14} className="mr-2" /> Delete
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <DropdownMenuItem onClick={() => alert("Report feature coming soon!")} className="cursor-pointer text-orange-600 focus:text-orange-600">
                    <Flag size={14} className="mr-2" /> Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="p-4 pt-1">
          <h3 className="font-bold text-xl mb-2 text-slate-900">{post.title}</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4 leading-relaxed">{post.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Clickable Map Location Tag */}
            <div 
              onClick={() => setShowMap(!showMap)}
              className="flex items-start gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 wrap-break-word max-w-full cursor-pointer hover:bg-blue-100 transition-colors shadow-sm"
            >
              <MapPin size={14} className="shrink-0 mt-0.5 text-blue-600" />
              <span className="leading-snug">
                {post.city} - {post.locationDetails} 
                <span className="text-blue-600 font-bold ml-1">({showMap ? 'Hide' : 'View'} Map)</span>
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
              <Phone size={14} className="text-slate-400" />
              {post.contactInfo}
            </div>
            
            {(post.reward ?? 0) > 0 && (
               <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                 <Gift size={14} />
                 Reward: ${post.reward}
               </div>
            )}
          </div>

          {/* Map View Toggle */}
          {showMap && post.latitude && post.longitude && (
            <div className="mb-4 mt-2 animate-in fade-in zoom-in-95 duration-200">
               <MapDisplay lat={post.latitude} lon={post.longitude} name={post.locationDetails} />
            </div>
          )}

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className={`grid gap-1.5 mt-2 rounded-xl overflow-hidden ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {post.images.slice(0, 4).map((img, index) => (
                <div key={img.id} className={`relative aspect-square ${post.images.length === 3 && index === 0 ? 'col-span-2' : ''}`}>
                  <Image src={img.url} alt="Post image" fill className="object-cover hover:opacity-95 transition-opacity cursor-pointer border border-slate-100" />
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Action Bar */}
        <div className="px-4 py-1 border-t border-slate-100 flex justify-between gap-1">
          <Button variant="ghost" className="flex-1 text-slate-500 hover:text-slate-800 font-semibold rounded-lg">
            <ThumbsUp size={18} className="mr-2" /> Like
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 text-slate-500 hover:text-slate-800 font-semibold rounded-lg"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={18} className="mr-2" /> Command
          </Button>
          <Button variant="ghost" className="flex-1 text-slate-500 hover:text-slate-800 font-semibold rounded-lg">
            <Share2 size={18} className="mr-2" /> Share
          </Button>
        </div>

        {/* COMMENTS SECTION */}
        {showComments && (
          <div className="w-full pt-4 px-4 pb-4 border-t border-slate-100 bg-slate-50/50 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-4 max-h-100 overflow-y-auto pr-2 pb-2">
              {isLoadingComments ? (
                <p className="text-center text-xs text-slate-400 py-2">Loading comments...</p>
              ) : comments?.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-2">No commands yet. Be the first!</p>
              ) : (
                comments?.map((comment) => (
                  <CommentThread key={comment.id} comment={comment} postId={post.id} />
                ))
              )}
            </div>
            
            <form onSubmit={handleAddComment} className="flex gap-2 pt-3 mt-1 border-t border-slate-200">
               <Avatar className="w-9 h-9 mt-0.5">
                  <AvatarImage src={currentUser?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">Me</AvatarFallback>
               </Avatar>
               <Input 
                 placeholder="Write a command..." 
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 className="flex-1 rounded-full h-10 bg-white border-slate-200 focus-visible:ring-1 shadow-sm"
                 disabled={isAddingComment}
               />
               <Button type="submit" className="rounded-full px-5 h-10 font-bold" disabled={!newComment.trim() || isAddingComment}>
                 Post
               </Button>
            </form>
          </div>
        )}
      </Card>

      {/* Edit Modal Component */}
      {isEditModalOpen && (
        <PostFormModal 
          open={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen} 
          postToEdit={post} 
        />
      )}
    </>
  );
}
