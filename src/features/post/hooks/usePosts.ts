import { useQuery, useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import {
  createPostService,
  updatePostService,
  getAllPostsService,
  deletePostService,
  toggleLikePostService,
  toggleBookmarkPostService,
  getBookmarksService,
  getUserPostsService,
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
    refetchInterval: 15000,
  });
};

export const useUserPosts = (userId: number, page = 0, size = 20) => {
  return useQuery<PageResponse<PostResponseDto>, Error>({
    queryKey: ["posts", "user", userId, page, size],
    queryFn: () => getUserPostsService(userId, page, size),
    enabled: !!userId,
  });
};

export const useBookmarkedPosts = (page = 0, size = 20) => {
  return useQuery<PageResponse<PostResponseDto>, Error>({
    queryKey: ["bookmarked-posts", page, size],
    queryFn: () => getBookmarksService(page, size),
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
      queryClient.invalidateQueries({ queryKey: ["review-content"] }); 
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
      queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
      queryClient.invalidateQueries({ queryKey: ["review-content"] });
    },
    onError: handleApiError,
  });
};

// --- OPTIMISTIC LIKE MUTATION ---
export const useToggleLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void, 
    unknown, 
    number, 
    { previousQueries: [QueryKey, unknown][] }
  >({
    mutationFn: (postId) => toggleLikePostService(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["bookmarked-posts"] });
      
      const previousPostQueries = queryClient.getQueriesData({ queryKey: ["posts"] }); 
      const previousBookmarkQueries = queryClient.getQueriesData({ queryKey: ["bookmarked-posts"] });
      const previousQueries = [...previousPostQueries, ...previousBookmarkQueries];

      previousQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !(oldData as PageResponse<PostResponseDto>).content) return; 
        
        const pageData = oldData as PageResponse<PostResponseDto>;
        const filters = (queryKey[1] || {}) as PostFilters & { sortBy?: string };

        const updatedContent = pageData.content.map((post) => {
          if (post.id === postId) {
            const isCurrentlyLiked = post.liked;
            const currentCount = Number(post.likeCount ?? post.LikeCount ?? 0);
            const newCount = isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1;

            return {
              ...post,
              liked: !isCurrentlyLiked,
              likeCount: newCount,
              LikeCount: newCount, 
            };
          }
          return post;
        });

        if (filters.sortBy === "TOP") {
          updatedContent.sort((a, b) => {
            const countA = Number(a.likeCount ?? a.LikeCount ?? 0);
            const countB = Number(b.likeCount ?? b.LikeCount ?? 0);
            if (countB !== countA) return countB - countA;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); 
          });
        }

        queryClient.setQueryData(queryKey, { ...pageData, content: updatedContent });
      });

      return { previousQueries };
    },
    onError: (err, _postId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleApiError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
    },
  });
};

// --- OPTIMISTIC BOOKMARK MUTATION ---
export const useToggleBookmarkPost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void, 
    unknown, 
    number, 
    { previousQueries: [QueryKey, unknown][] }
  >({
    mutationFn: (postId) => toggleBookmarkPostService(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["bookmarked-posts"] });
      
      const previousPostQueries = queryClient.getQueriesData({ queryKey: ["posts"] }); 
      const previousBookmarkQueries = queryClient.getQueriesData({ queryKey: ["bookmarked-posts"] });
      const previousQueries = [...previousPostQueries, ...previousBookmarkQueries];

      previousQueries.forEach(([queryKey, oldData]) => {
        if (!oldData || !(oldData as PageResponse<PostResponseDto>).content) return; 
        
        const pageData = oldData as PageResponse<PostResponseDto>;

        const updatedContent = pageData.content.map((post) => {
          if (post.id === postId) {
            return { ...post, bookmarked: !post.bookmarked };
          }
          return post;
        });

        queryClient.setQueryData(queryKey, { ...pageData, content: updatedContent });
      });

      return { previousQueries };
    },
    onError: (err, _postId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleApiError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
    },
  });
};
