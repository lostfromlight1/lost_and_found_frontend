import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import {
  getCommentsByPostService,
  createCommentService,
  createReplyService,
  updateCommentService,
  deleteCommentService,
  updateReplyService,
  deleteReplyService
} from "../services/comments.service";
import { CreateCommentRequest, CreateReplyRequest, UpdateCommentRequest } from "../api/request/comments.request";
import { CommentResponse, ReplyResponse } from "../api/response/comments.response";

// --- ERROR HANDLER ---
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

// --- HELPERS ---

export const calculateTotalCommentCount = (comments: CommentResponse[] = []): number => {
  let totalCount = 0;
  comments.forEach((comment) => {
    totalCount += 1; 
    if (comment.replies) {
      totalCount += comment.replies.length; 
      comment.replies.forEach((reply) => {
        if (reply.nestedReplies) {
          totalCount += reply.nestedReplies.length; 
        }
      });
    }
  });
  return totalCount;
};

// --- QUERIES ---

export const usePostComments = (postId: number) => {
  return useQuery<CommentResponse[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPostService(postId),
    enabled: !!postId,
  });
};

// --- MUTATIONS ---

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, unknown, CreateCommentRequest>({
    mutationFn: (data) => createCommentService(data),
    onSuccess: (_, variables) => {
      toast.success("Comment added successfully");
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
    onError: handleApiError,
  });
};

export const useCreateReply = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation<ReplyResponse, unknown, CreateReplyRequest>({
    mutationFn: (data) => createReplyService(data),
    onSuccess: () => {
      toast.success("Reply added successfully");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: handleApiError,
  });
};

export const useUpdateComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, unknown, { id: number; data: UpdateCommentRequest }>({
    mutationFn: ({ id, data }) => updateCommentService(id, data),
    onSuccess: () => {
      toast.success("Comment updated successfully");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      // Keep Admin Review Modal in sync
      queryClient.invalidateQueries({ queryKey: ["review-content"] });
    },
    onError: handleApiError,
  });
};

export const useDeleteComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number>({
    mutationFn: (id) => deleteCommentService(id),
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      // Keep Admin Review Modal in sync
      queryClient.invalidateQueries({ queryKey: ["review-content"] });
    },
    onError: handleApiError,
  });
};

export const useUpdateReply = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation<ReplyResponse, unknown, { id: number; data: UpdateCommentRequest }>({
    mutationFn: ({ id, data }) => updateReplyService(id, data),
    onSuccess: () => {
      toast.success("Reply updated successfully");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      // Keep Admin Review Modal in sync
      queryClient.invalidateQueries({ queryKey: ["review-content"] });
    },
    onError: handleApiError,
  });
};

export const useDeleteReply = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number>({
    mutationFn: (id) => deleteReplyService(id),
    onSuccess: () => {
      toast.success("Reply deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      // Keep Admin Review Modal in sync
      queryClient.invalidateQueries({ queryKey: ["review-content"] });
    },
    onError: handleApiError,
  });
};
