export interface ReplyResponse {
  id: number;
  content: string;
  userId: number;
  authorName: string;
  authorAvatarUrl?: string;
  commentId: number;
  replyToId?: number;
  replyToAuthorName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  nestedReplies?: ReplyResponse[];
}

export interface CommentResponse {
  id: number;
  content: string;
  userId: number;
  authorName: string;
  authorAvatarUrl?: string;
  postId: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  replies?: ReplyResponse[];
}
