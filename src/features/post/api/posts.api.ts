import { api as apiClient } from "@/lib/api/axios";
import { CreatePostRequest, UpdatePostRequest, PostFilters } from "./request/posts.request";
import { PostResponseDto, PageResponse } from "./response/posts.response";

export const createPostApi = async (data: CreatePostRequest): Promise<PostResponseDto> => {
  return await apiClient.post("/posts/create", data);
};

export const updatePostApi = async (id: number, data: UpdatePostRequest): Promise<PostResponseDto> => {
  return await apiClient.put(`/posts/${id}`, data);
};

export const getAllPostsApi = async (filters: PostFilters): Promise<PageResponse<PostResponseDto>> => {
  return await apiClient.get("/posts", { params: filters });
};

export const toggleLikePostApi = async (id: number): Promise<void> => {
  return await apiClient.post(`/posts/${id}/like`);
};

export const deletePostApi = async (id: number): Promise<void> => {
  return await apiClient.delete(`/posts/${id}`);
};

export const getPostByIdApi = async (id: number): Promise<PostResponseDto> => {
  return await apiClient.get(`/posts/${id}`);
};

export const toggleBookmarkPostApi = async (id: number): Promise<void> => {
  return await apiClient.post(`/posts/${id}/bookmark`);
};

export const getBookmarksApi = async (page = 0, size = 20): Promise<PageResponse<PostResponseDto>> => {
  return await apiClient.get("/posts/bookmarks", { params: { page, size } });
};

export const getUserPostsApi = async (userId: number, page = 0, size = 20): Promise<PageResponse<PostResponseDto>> => {
  return await apiClient.get(`/posts/user/${userId}`, { params: { page, size } });
};
