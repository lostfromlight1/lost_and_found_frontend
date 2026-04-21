import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import {
  getCommentsByPostService,
  createCommentService,
  createReplyService,
} from "../services/comments.service";
import { CreateCommentRequest, CreateReplyRequest } from "../api/request/comments.request";
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
