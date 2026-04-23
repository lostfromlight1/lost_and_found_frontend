"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Pencil, Trash2, Flag, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";
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

const MAX_DEPTH = 3;

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

// ----------------------------------------------------------------------
// ReplyItem Component
// ----------------------------------------------------------------------
const ReplyItem = ({
  reply,
  rootCommentId,
  rootReplyId,
  postId,
  currentUser,
  depth = 1,
}: {
  reply: ReplyResponse;
  rootCommentId: number;
  rootReplyId: number;
  postId: number;
  currentUser: CurrentUser | undefined;
  depth?: number;
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const { mutate: addReply, isPending: isAdding } = useCreateReply(postId);
  const { mutate: updateReply, isPending: isUpdating } = useUpdateReply(postId);
  const { mutate: deleteReply } = useDeleteReply(postId);

  const isOwner = String(currentUser?.id) === String(reply.userId);
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isOwner || isAdmin;
  const hasChildren = (reply.nestedReplies?.length ?? 0) > 0;
  
  // Controls how much we shift to the right based on depth
  const effectiveIndent = depth <= MAX_DEPTH ? "pl-8" : "pl-4";

  const submitReply = () => {
    if (!replyContent.trim()) return;
    addReply(
      {
        commentId: rootCommentId,
        content: `@${reply.authorName} ${replyContent.trim()}`,
        replyToId: rootReplyId, 
      },
      { onSuccess: () => { setReplyContent(""); setIsReplying(false); setIsOpen(true); } }
    );
  };

  return (
    <div className={`relative pt-3 ${effectiveIndent} min-w-fit`}>
      {/* Thread line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100 z-0" />
      <div className="absolute left-3 top-7 w-4 h-px bg-slate-100 z-0" />

      <div className="flex gap-2 relative group">
        <Avatar className="w-7 h-7 rounded-full border border-slate-200 bg-white z-10 shrink-0 overflow-hidden aspect-square">
          <AvatarImage src={reply.authorAvatarUrl || undefined} className="object-cover w-full h-full" />
          <AvatarFallback className="flex items-center justify-center w-full h-full text-[10px]">
            {reply.authorName?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col w-full pb-1 min-w-[220px]">
          <div className="flex items-center justify-between">
            <div className="text-[12px] whitespace-nowrap flex items-center gap-1">
              <span className="font-bold text-slate-900">{reply.authorName}</span>
              <span className="text-slate-500">· {format(safeDate(reply.createdAt), "MMM d")}</span>
            </div>
            
            {currentUser && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 hover:bg-slate-50 p-1 transition-all outline-none rounded-full">
                  <MoreHorizontal size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-md p-1">
                  {isOwner && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer rounded-lg py-2 px-3 text-[13px]">
                      <Pencil size={14} className="mr-2"/> Edit
                    </DropdownMenuItem>
                  )}
                  {canManage && (
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg py-2 px-3 text-[13px]">
                      <Trash2 size={14} className="mr-2"/> Delete
                    </DropdownMenuItem>
                  )}
                  {!isOwner && (
                    <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} className="cursor-pointer rounded-lg py-2 px-3 text-[13px]">
                      <Flag size={14} className="mr-2" /> Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <CommentInput
                value={editContent}
                onChange={setEditContent}
                onSubmit={() => updateReply({ id: reply.id, data: { content: editContent } }, { onSuccess: () => setIsEditing(false) })}
                isLoading={isUpdating}
                isEditing
                hideAvatar
                onCancelEdit={() => setIsEditing(false)}
                buttonText="Save"
              />
            </div>
          ) : (
            <div className="mt-0.5">
              <p className="text-[13px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                {formatContent(reply.content)}
              </p>
              
              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <MessageCircle size={12} /> Reply
                </button>

                {hasChildren && (
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#1d9bf0] hover:underline"
                  >
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {isOpen ? "Hide" : `Show ${reply.nestedReplies?.length} replies`}
                  </button>
                )}
              </div>
            </div>
          )}

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {reply.nestedReplies?.map((r) => (
                  <ReplyItem
                    key={r.id}
                    reply={r}
                    rootCommentId={rootCommentId}
                    rootReplyId={rootReplyId}
                    postId={postId}
                    currentUser={currentUser}
                    depth={depth + 1}
                  />
                ))}

                {isReplying && (
                  <div className="mt-3 relative pl-8">
                    <div className="absolute left-3 top-0 bottom-6 w-px bg-slate-200" />
                    <div className="absolute left-3 bottom-6 w-4 h-px bg-slate-200" />
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <DeleteConfirmationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={() => deleteReply(reply.id, { onSuccess: () => setIsDeleteDialogOpen(false) })} entityLabel="reply" />
      <ReportModal open={isReportModalOpen} onOpenChange={setIsReportModalOpen} targetType="COMMENT" targetId={reply.id} />
    </div>
  );
};

// ----------------------------------------------------------------------
// Root CommentCard Component
// ----------------------------------------------------------------------
export default function CommentCard({ comment, postId, currentUser }: { comment: CommentResponse, postId: number, currentUser: CurrentUser | undefined }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); 
  const [isOpen, setIsOpen] = useState(true);
  
  const { mutate: addReply, isPending: isAdding } = useCreateReply(postId);
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(postId);
  const { mutate: deleteComment } = useDeleteComment(postId);

  const isOwner = String(currentUser?.id) === String(comment.userId);
  const canManage = isOwner || currentUser?.role === "ADMIN";
  const hasReplies = (comment.replies?.length ?? 0) > 0;

  return (
    <div className="flex flex-col w-full pb-2 pt-4 border-b border-slate-50 last:border-0 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 relative min-w-fit pr-6">
        {(hasReplies || isReplying) && isOpen && (
          <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-100 z-0" />
        )}

        <Avatar className="w-10 h-10 rounded-full border border-slate-200 bg-white z-10 shrink-0 overflow-hidden aspect-square">
          <AvatarImage src={comment.authorAvatarUrl || undefined} className="object-cover w-full h-full" />
          <AvatarFallback className="flex items-center justify-center w-full h-full text-sm font-bold">
            {comment.authorName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col w-full pb-1 min-w-[280px]">
          <div className="flex items-center justify-between">
            <div className="text-[14px] whitespace-nowrap flex items-center gap-1">
              <span className="font-bold text-slate-900">{comment.authorName}</span>
              <span className="text-slate-500 text-[13px]">· {format(safeDate(comment.createdAt), "MMM d, h:mm a")}</span>
            </div>

            {currentUser && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 hover:bg-slate-50 p-1.5 transition-colors outline-none rounded-full flex items-center justify-center">
                  <MoreHorizontal size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-100 shadow-md p-1">
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
            <div className="mt-2">
              <CommentInput
                value={editContent}
                onChange={setEditContent}
                onSubmit={() => updateComment({ id: comment.id, data: { content: editContent } }, { onSuccess: () => setIsEditing(false) })}
                isLoading={isUpdating}
                isEditing
                hideAvatar
                onCancelEdit={() => setIsEditing(false)}
                buttonText="Save"
              />
            </div>
          ) : (
            <div>
              <p className="text-[14px] text-slate-800 whitespace-pre-wrap mt-1 leading-relaxed">
                {formatContent(comment.content)}
              </p>
              
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1 text-[12px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <MessageCircle size={14} /> Reply
                </button>

                {hasReplies && (
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 text-[12px] font-bold text-[#1d9bf0] hover:underline"
                  >
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isOpen ? "Hide replies" : `Show ${comment.replies?.length} replies`}
                  </button>
                )}
              </div>
            </div>
          )}

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {comment.replies?.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    rootCommentId={comment.id}
                    rootReplyId={reply.id}
                    postId={postId}
                    currentUser={currentUser}
                    depth={1}
                  />
                ))}

                {isReplying && (
                  <div className="mt-4 ml-10 relative">
                    <div className="absolute -left-5 top-4 w-5 h-px bg-slate-300 z-0" />
                    <CommentInput
                      value={replyContent}
                      onChange={setReplyContent}
                      onSubmit={() => addReply({ commentId: comment.id, content: `@${comment.authorName} ${replyContent.trim()}` }, { onSuccess: () => { setReplyContent(""); setIsReplying(false); setIsOpen(true); } })}
                      isLoading={isAdding}
                      avatarUrl={currentUser?.avatarUrl}
                      mentionPrefix={comment.authorName}
                      placeholder="Write a reply..."
                      buttonText="Reply"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <DeleteConfirmationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={() => deleteComment(comment.id, { onSuccess: () => setIsDeleteDialogOpen(false) })} entityLabel="comment" />
      <ReportModal open={isReportModalOpen} onOpenChange={setIsReportModalOpen} targetType="COMMENT" targetId={comment.id} />
    </div>
  );
}
