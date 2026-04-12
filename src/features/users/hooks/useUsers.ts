import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import { 
  getAllUsersApi, 
  searchUsersApi, 
  banUserApi, 
  updateProfileApi 
} from "../api/users.api";
import { UpdateProfileRequest } from "../api/request/users.request";

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as BaseErrorResponse | undefined;

    if (responseData) {
      const { message, validationErrors } = responseData;

      if (validationErrors && Object.keys(validationErrors).length > 0) {
        Object.values(validationErrors).forEach((msg) => toast.warning(String(msg)));
      } else {
        const lowerMsg = (message || "").toLowerCase();
        if (lowerMsg.includes("already banned") || lowerMsg.includes("already locked")) {
          toast.warning("This user is already banned.");
        } else {
          toast.warning(message || "We encountered a slight issue. Please try again.");
        }
      }
    } else {
      toast.warning("Network issue. Please check your connection and try again.");
    }
  } else if (error instanceof Error) {
    toast.warning(error.message || "Something went slightly wrong. Please try again.");
  } else {
    toast.warning("An unexpected issue occurred. Please try again.");
  }
};

export const useUsers = (query: string, page = 0) => {
  return useQuery({
    queryKey: ["users", query, page],
    queryFn: () => (query.trim() ? searchUsersApi(query, page) : getAllUsersApi(page)),
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => banUserApi(id),
    onSuccess: () => {
      toast.success("User banned successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: handleApiError,
  });
};

export const useUpdateProfile = () => {
  const { update } = useSession();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfileApi(data),
    onSuccess: async (_, variables) => { 
      toast.success("Profile updated successfully");
      
      await update({
        displayName: variables.displayName,
        contactInfo: variables.contactInfo
      });
    },
    onError: handleApiError,
  });
};
