import { getCommentsByPostApi, createCommentApi, createReplyApi } from "../api/comments.api";
import { CreateCommentRequest, CreateReplyRequest } from "../api/request/comments.request";
import { CommentResponse, ReplyResponse } from "../api/response/comments.response";

export const getCommentsByPostService = async (postId: number): Promise<CommentResponse[]> => {
  const response = await getCommentsByPostApi(postId);
  return response as unknown as CommentResponse[]; 
};

export const createCommentService = async (data: CreateCommentRequest): Promise<CommentResponse> => {
  const response = await createCommentApi(data);
  return response as unknown as CommentResponse;
};

export const createReplyService = async (data: CreateReplyRequest): Promise<ReplyResponse> => {
  const response = await createReplyApi(data);
  return response as unknown as ReplyResponse;
};
