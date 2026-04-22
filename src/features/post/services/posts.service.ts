import { createPostApi, updatePostApi, getAllPostsApi, toggleLikePostApi, deletePostApi } from "../api/posts.api";
import { CreatePostRequest, UpdatePostRequest, PostFilters } from "../api/request/posts.request";
import { PostResponseDto, PageResponse } from "../api/response/posts.response";

export const createPostService = async (
  data: CreatePostRequest,
): Promise<PostResponseDto> => {
  return await createPostApi(data);
};

export const updatePostService = async (
  id: number,
  data: UpdatePostRequest,
): Promise<PostResponseDto> => {
  return await updatePostApi(id, data);
};

export const getAllPostsService = async (
  filters: PostFilters,
): Promise<PageResponse<PostResponseDto>> => {
  return await getAllPostsApi(filters);
};

export const toggleLikePostService = async (id: number): Promise<void> => {
  return await toggleLikePostApi(id);
};

export const deletePostService = async (id: number): Promise<void> => {
  return await deletePostApi(id);
};
