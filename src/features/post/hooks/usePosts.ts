import { useQuery, useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import {
  createPostService,
  updatePostService,
  getAllPostsService,
  getPostByIdService,
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

const updatePostInPageResponse = (
  oldData: unknown,
  updater: (post: PostResponseDto) => PostResponseDto,
) => {
  if (!oldData || !(oldData as PageResponse<PostResponseDto>).content) return oldData;

  const pageData = oldData as PageResponse<PostResponseDto>;

  return {
    ...pageData,
    content: pageData.content.map((post) =>
      post.id === updater(post).id ? updater(post) : post,
    ),
  };
};

const updatePostInAllPagedQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  queryPrefix: QueryKey,
  postId: number,
  updater: (post: PostResponseDto) => PostResponseDto,
) => {
  const queries = queryClient.getQueriesData({ queryKey: queryPrefix });

  queries.forEach(([queryKey, oldData]) => {
    if (!oldData || !(oldData as PageResponse<PostResponseDto>).content) return;

    const pageData = oldData as PageResponse<PostResponseDto>;
    let updatedContent = pageData.content.map((post) =>
      post.id === postId ? updater(post) : post,
    );

    const filters = (queryKey[1] || {}) as PostFilters & { sortBy?: string };

    if (filters.sortBy === "TOP") {
      updatedContent = [...updatedContent].sort((a, b) => {
        const countA = Number(a.likeCount ?? a.LikeCount ?? 0);
        const countB = Number(b.likeCount ?? b.LikeCount ?? 0);
        if (countB !== countA) return countB - countA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    queryClient.setQueryData(queryKey, {
      ...pageData,
      content: updatedContent,
    });
  });
};

// --- QUERIES ---

export const usePosts = (filters: PostFilters) => {
  return useQuery<PageResponse<PostResponseDto>, Error>({
    queryKey: ["posts", filters],
    queryFn: () => getAllPostsService(filters),
    refetchInterval: 15000,
  });
};

export const usePost = (postId: number) => {
  return useQuery<PostResponseDto, Error>({
    queryKey: ["post", postId],
    queryFn: () => getPostByIdService(postId),
    enabled: !!postId,
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
      queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
    },
    onError: handleApiError,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<PostResponseDto, unknown, { id: number; data: UpdatePostRequest }>({
    mutationFn: ({ id, data }) => updatePostService(id, data),
    onSuccess: (updatedPost) => {
      toast.success("Post updated successfully");

      queryClient.setQueryData(["post", updatedPost.id], updatedPost);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
      queryClient.invalidateQueries({ queryKey: ["review-content"] });
    },
    onError: handleApiError,
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number>({
    mutationFn: (id) => deletePostService(id),
    onSuccess: (_data, deletedId) => {
      toast.success("Post deleted successfully");

      queryClient.removeQueries({ queryKey: ["post", deletedId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
      queryClient.invalidateQueries({ queryKey: ["review-content"] });
    },
    onError: handleApiError,
  });
};

export const useToggleLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    number,
    {
      previousQueries: [QueryKey, unknown][];
      previousDetail?: PostResponseDto;
    }
  >({
    mutationFn: (postId) => toggleLikePostService(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["bookmarked-posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousPostQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      const previousBookmarkQueries = queryClient.getQueriesData({ queryKey: ["bookmarked-posts"] });
      const previousQueries = [...previousPostQueries, ...previousBookmarkQueries];
      const previousDetail = queryClient.getQueryData<PostResponseDto>(["post", postId]);

      const optimisticUpdater = (post: PostResponseDto): PostResponseDto => {
        const isCurrentlyLiked = post.liked;
        const currentCount = Number(post.likeCount ?? post.LikeCount ?? 0);
        const newCount = isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1;

        return {
          ...post,
          liked: !isCurrentlyLiked,
          likeCount: newCount,
          LikeCount: newCount,
        };
      };

      updatePostInAllPagedQueries(queryClient, ["posts"], postId, optimisticUpdater);
      updatePostInAllPagedQueries(queryClient, ["bookmarked-posts"], postId, optimisticUpdater);

      if (previousDetail) {
        queryClient.setQueryData(["post", postId], optimisticUpdater(previousDetail));
      }

      return { previousQueries, previousDetail };
    },
    onError: (err, postId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (context?.previousDetail) {
        queryClient.setQueryData(["post", postId], context.previousDetail);
      }

      handleApiError(err);
    },
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
};

export const useToggleBookmarkPost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    number,
    {
      previousQueries: [QueryKey, unknown][];
      previousDetail?: PostResponseDto;
    }
  >({
    mutationFn: (postId) => toggleBookmarkPostService(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["bookmarked-posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      const previousPostQueries = queryClient.getQueriesData({ queryKey: ["posts"] });
      const previousBookmarkQueries = queryClient.getQueriesData({ queryKey: ["bookmarked-posts"] });
      const previousQueries = [...previousPostQueries, ...previousBookmarkQueries];
      const previousDetail = queryClient.getQueryData<PostResponseDto>(["post", postId]);

      const optimisticUpdater = (post: PostResponseDto): PostResponseDto => ({
        ...post,
        bookmarked: !post.bookmarked,
      });

      updatePostInAllPagedQueries(queryClient, ["posts"], postId, optimisticUpdater);
      updatePostInAllPagedQueries(queryClient, ["bookmarked-posts"], postId, optimisticUpdater);

      if (previousDetail) {
        queryClient.setQueryData(["post", postId], optimisticUpdater(previousDetail));
      }

      return { previousQueries, previousDetail };
    },
    onError: (err, postId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (context?.previousDetail) {
        queryClient.setQueryData(["post", postId], context.previousDetail);
      }

      handleApiError(err);
    },
    onSettled: (_data, _error, postId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarked-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
};