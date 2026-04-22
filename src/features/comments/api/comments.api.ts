import { api as apiClient } from "@/lib/api/axios";
import { CreateCommentRequest, CreateReplyRequest, UpdateCommentRequest } from "./request/comments.request";

export const getCommentsByPostApi = async (postId: number) => {
  return await apiClient.get(`/comments/post/${postId}`);
};

export const createCommentApi = async (data: CreateCommentRequest) => {
  return await apiClient.post("/comments", data);
};

export const createReplyApi = async (data: CreateReplyRequest) => {
  return await apiClient.post("/replies", data);
};

export const updateCommentApi = async (id: number, data: UpdateCommentRequest) => {
  return await apiClient.put(`/comments/${id}`, data);
};

export const deleteCommentApi = async (id: number) => {
  return await apiClient.delete(`/comments/${id}`);
};

export const updateReplyApi = async (id: number, data: UpdateCommentRequest) => {
  return await apiClient.put(`/replies/${id}`, data);
};

export const deleteReplyApi = async (id: number) => {
  return await apiClient.delete(`/replies/${id}`);
};
