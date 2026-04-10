import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { AxiosError } from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import { 
  getAllUsersApi, 
  searchUsersApi, 
  banUserApi, 
  updateProfileApi 
} from "../api/users.api";
import { UpdateProfileRequest } from "../api/request/users.request";

export const useUsers = (query: string, page = 0) => {
  return useQuery({
    queryKey: ["users", query, page],
    queryFn: () => (query.trim() ? searchUsersApi(query, page) : getAllUsersApi(page)),
  });
};;

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => banUserApi(id),
    onSuccess: () => {
      toast.success("User banned successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<BaseErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to ban user");
    },
  });
};

export const useUpdateProfile = () => {
  const { update } = useSession();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfileApi(data),
    onSuccess: async () => {
      toast.success("Profile updated");
      await update();
    },
    onError: (error: AxiosError<BaseErrorResponse>) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });
};
