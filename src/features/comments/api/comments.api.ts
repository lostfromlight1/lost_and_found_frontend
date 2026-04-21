import { api as apiClient } from "@/lib/api/axios";
import { CreateCommentRequest, CreateReplyRequest } from "./request/comments.request";

export const getCommentsByPostApi = async (postId: number) => {
  return await apiClient.get(`/comments/post/${postId}`);
};

export const createCommentApi = async (data: CreateCommentRequest) => {
  return await apiClient.post("/comments", data);
};

export const createReplyApi = async (data: CreateReplyRequest) => {
  return await apiClient.post("/replies", data);
};
