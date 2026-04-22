export interface CreateCommentRequest {
  postId: number;
  content: string;
  imageUrl?: string;
  imagePublicId?: string;
}

export interface CreateReplyRequest {
  commentId: number;
  content: string;
  replyToId?: number; 
  imageUrl?: string;
  imagePublicId?: string;
}

export interface UpdateCommentRequest {
  content: string;
  imageUrl?: string;
  imagePublicId?: string;
}
