import { 
  createPostApi, 
  updatePostApi, 
  getAllPostsApi, 
  getPostByIdApi, 
  toggleLikePostApi, 
  deletePostApi,
  toggleBookmarkPostApi, 
  getBookmarksApi,       
  getUserPostsApi        
} from "../api/posts.api";
import { CreatePostRequest, UpdatePostRequest, PostFilters } from "../api/request/posts.request";
import { PostResponseDto, PageResponse } from "../api/response/posts.response";

export const createPostService = async (data: CreatePostRequest): Promise<PostResponseDto> => {
  return await createPostApi(data);
};

export const updatePostService = async (id: number, data: UpdatePostRequest): Promise<PostResponseDto> => {
  return await updatePostApi(id, data);
};

export const getAllPostsService = async (filters: PostFilters): Promise<PageResponse<PostResponseDto>> => {
  return await getAllPostsApi(filters);
};

export const toggleLikePostService = async (id: number): Promise<void> => {
  return await toggleLikePostApi(id);
};

export const deletePostService = async (id: number): Promise<void> => {
  return await deletePostApi(id);
};

export const getPostByIdService = async (id: number): Promise<PostResponseDto> => {
  return await getPostByIdApi(id);
};

export const toggleBookmarkPostService = async (id: number): Promise<void> => {
  return await toggleBookmarkPostApi(id);
};

export const getBookmarksService = async (page = 0, size = 20): Promise<PageResponse<PostResponseDto>> => {
  return await getBookmarksApi(page, size);
};

export const getUserPostsService = async (userId: number, page = 0, size = 20): Promise<PageResponse<PostResponseDto>> => {
  return await getUserPostsApi(userId, page, size);
};
