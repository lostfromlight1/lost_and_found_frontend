import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import {
  createPostService,
  updatePostService,
  getAllPostsService,
  deletePostService,
} from "../services/posts.service";
import {
  CreatePostRequest,
  UpdatePostRequest,
  PostFilters,
} from "../api/request/posts.request";
import { PostResponseDto, PageResponse } from "../api/response/posts.response";

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as BaseErrorResponse | undefined;
    if (responseData?.validationErrors) {
      Object.values(responseData.validationErrors).forEach((msg) =>
        toast.warning(String(msg)),
      );
    } else {
      toast.warning(responseData?.message || "An error occurred");
    }
  } else {
    toast.error("An unexpected error occurred");
  }
};

// --- QUERIES ---

export const usePosts = (filters: PostFilters) => {
  return useQuery<PageResponse<PostResponseDto>, Error>({
    queryKey: ["posts", filters],
    queryFn: () => getAllPostsService(filters),
  });
};

// --- MUTATIONS ---

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<PostResponseDto, unknown, CreatePostRequest>({
    mutationFn: (data) => createPostService(data),
    onSuccess: () => {
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: handleApiError,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<PostResponseDto, unknown, { id: number; data: UpdatePostRequest }>({
    mutationFn: ({ id, data }) => updatePostService(id, data),
    
    onSuccess: () => {
      toast.success("Post updated successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: handleApiError,
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number>({
    mutationFn: (id) => deletePostService(id),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: handleApiError,
  });
};
