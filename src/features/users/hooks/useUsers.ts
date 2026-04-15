import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import {
  getAllUsersService,
  searchUsersService,
  banUserService,
  unbanUserService,
  updateProfileService,
  uploadAvatarService,
} from "../services/users.service";
import { UpdateProfileRequest } from "../api/request/users.request";
import { UserResponse } from "../api/response/users.response";

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as BaseErrorResponse | undefined;
    if (responseData?.validationErrors) {
      Object.values(responseData.validationErrors).forEach((msg) =>
        toast.warning(String(msg))
      );
    } else {
      toast.warning(responseData?.message || "An error occurred");
    }
  } else {
    toast.error("An unexpected error occurred");
  }
};

export const useUsers = (query: string, page = 0) => {
  return useQuery({
    queryKey: ["users", query, page],
    queryFn: () => (query.trim() ? searchUsersService(query, page) : getAllUsersService(page)),
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => banUserService(id),
    onSuccess: () => {
      toast.success("User banned successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] }); 
    },
    onError: handleApiError,
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unbanUserService(id),
    onSuccess: () => {
      toast.success("User unbanned successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] }); 
    },
    onError: handleApiError,
  });
};

export const useUpdateProfile = () => {
  const { data: session, update } = useSession();

  return useMutation<UserResponse, unknown, UpdateProfileRequest>({
    mutationFn: (data) => updateProfileService(data),
    onSuccess: async (updatedUser) => {
      toast.success("Profile updated successfully");
      
      await update({
        user: {
          ...session?.user, 
          id: updatedUser.id,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          contactInfo: updatedUser.contactInfo ?? "",
          role: updatedUser.role,
          avatarUrl: updatedUser.avatarUrl ?? session?.user?.avatarUrl ?? null,
          avatarPublicId: updatedUser.avatarPublicId ?? session?.user?.avatarPublicId ?? null,
          isLocked: updatedUser.isLocked,
        },
      });
    },
    onError: handleApiError,
  });
};
export const useUploadAvatar = () => {
  const { update } = useSession();

  return useMutation({
    mutationFn: (file: File) => uploadAvatarService(file),
    onSuccess: async (updatedUser) => {
      toast.success("Profile picture updated successfully");
      
      await update({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          contactInfo: updatedUser.contactInfo ?? "",
          role: updatedUser.role,
          avatarUrl: updatedUser.avatarUrl ?? null,
          avatarPublicId: updatedUser.avatarPublicId ?? null,
          isLocked: updatedUser.isLocked,
        },
      });
    },
    onError: handleApiError,
  });
};
