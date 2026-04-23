"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { MessageCircle, Pencil, Trash2, Flag, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommentResponse, ReplyResponse } from "@/features/comments/api/response/comments.response";
import { 
  useCreateReply, 
  useUpdateComment, 
  useDeleteComment, 
  useUpdateReply,     
  useDeleteReply 
} from "@/features/comments/hooks/useComments";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import CommentInput from "@/features/comments/components/CommentInput";
import ReportModal from "@/features/reports/components/ReportModal";

const safeDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return new Date();
  if (dateStr.length === 10) return new Date(`${dateStr}T00:00:00`);
  return new Date(dateStr.endsWith("Z") ? dateStr : `${dateStr}Z`);
};

export type CurrentUser = {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  role?: string;
};

const formatContent = (text: string) => {
  const match = text.match(/^(@[a-zA-Z0-9_]+(?:\s[a-zA-Z0-9_]+)?)(?=\s|$)/);
  if (match) {
    const mention = match[1];
    const rest = text.slice(mention.length);
    return (
      <>
        <span className="text-blue-600 font-semibold">{mention}</span>
        {rest}
      </>
    );
  }
  return text;
};

const ReplyItem = ({
  reply,
  rootCommentId,
  postId,
  currentUser,
}: {
  reply: ReplyResponse;
  rootCommentId: number;
  postId: number;
  currentUser: CurrentUser | undefined;
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { mutate: addReply, isPending: isAdding } = useCreateReply(postId);
  const { mutate: updateReply, isPending: isUpdating } = useUpdateReply(postId);
  const { mutate: deleteReply } = useDeleteReply(postId);

  const isOwner = String(currentUser?.id) === String(reply.userId);
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isOwner || isAdmin;

  const submitReply = () => {
    if (!replyContent.trim()) return;
    addReply(
      {
        commentId: rootCommentId,
        content: `@${reply.authorName} ${replyContent.trim()}`,
        replyToId: reply.id,
      },
      {
        onSuccess: () => {
          setReplyContent("");
          setIsReplying(false);
        },
      }
    );
  };

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    updateReply(
      { id: reply.id, data: { content: editContent } },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const confirmDelete = () => {
    deleteReply(reply.id, {
      onSuccess: () => setIsDeleteDialogOpen(false),
      onError: () => {
        toast.error("Failed to delete reply");
        setIsDeleteDialogOpen(false);
      }
    });
  };

  return (
    <div className="relative pl-6 pt-2">
      <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-300 z-0" />
      <div className="absolute left-2 top-6 w-4 h-px bg-slate-300 z-0" />

      <div className="flex gap-2 relative">
        <Avatar className="w-8 h-8 rounded-full border border-slate-200 bg-white z-10 shrink-0 overflow-hidden aspect-square">
          <AvatarImage src={reply.authorAvatarUrl || undefined} className="object-cover w-full h-full" />
          <AvatarFallback className="flex items-center justify-center w-full h-full text-xs">
            {reply.authorName?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col w-full pb-1">
          <div className="flex items-center justify-between">
            <div className="text-[13px]">
              <span className="font-semibold text-slate-900">
                {reply.authorName}
              </span>
              <span className="text-slate-500 ml-1">
                · {format(safeDate(reply.createdAt), "MMM d, h:mm a")}
              </span>
            </div>
            
            {currentUser && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 hover:bg-slate-50 p-1.5 ml-1 transition-colors outline-none rounded-full flex items-center justify-center">
                  <MoreHorizontal size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-md p-1">
                  {isOwner && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50 text-[13px]">
                      <Pencil size={14} className="mr-2"/> Edit
                    </DropdownMenuItem>
                  )}
                  {canManage && (
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg font-medium py-2 px-3 focus:bg-red-50 text-[13px]">
                      <Trash2 size={14} className="mr-2"/> Delete
                    </DropdownMenuItem>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50 text-[13px]">
                      <Flag size={14} className="mr-2" /> Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <CommentInput
              value={editContent}
              onChange={setEditContent}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              isEditing
              hideAvatar
              onCancelEdit={() => setIsEditing(false)}
              buttonText="Save"
            />
          ) : (
            <>
              <p className="text-[13px] text-slate-800 whitespace-pre-wrap mt-1 leading-relaxed">
                {formatContent(reply.content)}
              </p>
              <button
                type="button"
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-slate-800 mt-1 self-start transition-colors"
              >
                <MessageCircle size={13} /> Reply
              </button>
            </>
          )}

          {(reply.nestedReplies?.length ?? 0) > 0 && (
            <div className="mt-1">
              {reply.nestedReplies?.map((r) => (
                <ReplyItem
                  key={r.id}
                  reply={r}
                  rootCommentId={rootCommentId}
                  postId={postId}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}

          {isReplying && (
            <div className="mt-3 relative">
              <div className="absolute -left-6 top-3.5 w-6 h-px bg-slate-300 z-0" />
              <CommentInput
                value={replyContent}
                onChange={setReplyContent}
                onSubmit={submitReply}
                isLoading={isAdding}
                avatarUrl={currentUser?.avatarUrl}
                mentionPrefix={reply.authorName}
                placeholder="Write a reply..."
                buttonText="Reply"
              />
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        entityLabel="reply"
      />

      <ReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        targetType="COMMENT"
        targetId={reply.id}
      />
    </div>
  );
};

export default function CommentCard({ comment, postId, currentUser }: { comment: CommentResponse, postId: number, currentUser: CurrentUser | undefined }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); 
  
  const { mutate: addReply, isPending: isAdding } = useCreateReply(postId);
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(postId);
  const { mutate: deleteComment } = useDeleteComment(postId);

  const isOwner = String(currentUser?.id) === String(comment.userId);
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isOwner || isAdmin;

  const submitReply = () => {
    if (!replyContent.trim()) return;
    addReply(
      { 
        commentId: comment.id, 
        content: `@${comment.authorName} ${replyContent.trim()}` 
      },
      { onSuccess: () => { setReplyContent(""); setIsReplying(false); } }
    );
  };

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    updateComment(
      { id: comment.id, data: { content: editContent } },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const confirmDelete = () => {
    deleteComment(comment.id, {
      onSuccess: () => setIsDeleteDialogOpen(false),
      onError: () => {
        toast.error("Failed to delete comment");
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const hasReplies = (comment.replies?.length ?? 0) > 0;

  return (
    <div className="flex flex-col w-full pb-4 pt-4 border-b border-slate-100 last:border-0 relative">
      <div className="flex gap-2 relative">
        {(hasReplies || isReplying) && (
          <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-300 z-0" />
        )}

        <Avatar className="w-10 h-10 rounded-full border border-slate-200 bg-white z-10 shrink-0 overflow-hidden aspect-square">
          <AvatarImage src={comment.authorAvatarUrl || undefined} className="object-cover w-full h-full" />
          <AvatarFallback className="flex items-center justify-center w-full h-full">{comment.authorName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col w-full pb-1">
          <div className="flex items-center justify-between">
            <div className="text-[14px]">
              <span className="font-semibold text-slate-900">{comment.authorName}</span>
              <span className="text-slate-500 ml-1">
                · {format(safeDate(comment.createdAt), "MMM d, h:mm a")}
              </span>
            </div>

            {currentUser && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 hover:bg-slate-50 p-1.5 ml-1 transition-colors outline-none rounded-full flex items-center justify-center">
                  <MoreHorizontal size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-md p-1">
                  {isOwner && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50 text-[13px]">
                      <Pencil size={14} className="mr-2"/> Edit
                    </DropdownMenuItem>
                  )}
                  {canManage && (
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg font-medium py-2 px-3 focus:bg-red-50 text-[13px]">
                      <Trash2 size={14} className="mr-2"/> Delete
                    </DropdownMenuItem>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} className="cursor-pointer rounded-lg font-medium py-2 px-3 focus:bg-slate-50 text-[13px]">
                      <Flag size={14} className="mr-2" /> Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <CommentInput
              value={editContent}
              onChange={setEditContent}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              isEditing
              hideAvatar
              onCancelEdit={() => setIsEditing(false)}
              buttonText="Save"
            />
          ) : (
            <>
              <p className="text-[14px] text-slate-800 whitespace-pre-wrap mt-1 leading-relaxed">
                {formatContent(comment.content)}
              </p>
              <button
                type="button"
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-slate-800 mt-1.5 self-start transition-colors"
              >
                <MessageCircle size={14} /> Reply
              </button>
            </>
          )}

          {hasReplies && (
            <div className="mt-2 ml-3">
              {comment.replies?.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  rootCommentId={comment.id}
                  postId={postId}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}

          {isReplying && (
             <div className="mt-3 ml-9 relative">
               <div className="absolute -left-6 top-4 w-6 h-px bg-slate-300 z-0" />
               <CommentInput
                 value={replyContent}
                 onChange={setReplyContent}
                 onSubmit={submitReply}
                 isLoading={isAdding}
                 avatarUrl={currentUser?.avatarUrl}
                 mentionPrefix={comment.authorName}
                 placeholder="Write a reply..."
                 buttonText="Reply"
               />
             </div>
          )}
        </div>
      </div>

      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        entityLabel="comment"
      />

      <ReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        targetType="COMMENT"
        targetId={comment.id}
      />
    </div>
  );
}
