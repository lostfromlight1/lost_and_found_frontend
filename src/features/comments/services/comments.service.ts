import { 
  getCommentsByPostApi, 
  createCommentApi, 
  createReplyApi,
  updateCommentApi,
  deleteCommentApi,
  updateReplyApi,
  getCommentByIdApi,
  deleteReplyApi
} from "../api/comments.api";
import { CreateCommentRequest, CreateReplyRequest, UpdateCommentRequest } from "../api/request/comments.request";
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

export const updateCommentService = async (id: number, data: UpdateCommentRequest): Promise<CommentResponse> => {
  const response = await updateCommentApi(id, data);
  return response as unknown as CommentResponse;
};

export const deleteCommentService = async (id: number): Promise<void> => {
  await deleteCommentApi(id);
};

export const updateReplyService = async (id: number, data: UpdateCommentRequest): Promise<ReplyResponse> => {
  const response = await updateReplyApi(id, data);
  return response as unknown as ReplyResponse;
};

export const deleteReplyService = async (id: number): Promise<void> => {
  await deleteReplyApi(id);
};

export const getCommentByIdService = async (id: number): Promise<CommentResponse> => {
  return await getCommentByIdApi(id);
};
