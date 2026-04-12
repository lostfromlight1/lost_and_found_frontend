import { api as apiClient } from "@/lib/api/axios";
import { PaginatedResponse } from "@/types/api.types";
import { UserResponse } from "@/features/auth/api/response/auth.response";
import { UpdateProfileRequest } from "./request/users.request";

export const getAllUsersApi = async (page = 0, size = 20): Promise<PaginatedResponse<UserResponse>> => {
  const response = await apiClient.get("/users", { params: { page, size } });
  return response as unknown as PaginatedResponse<UserResponse>;
};

export const searchUsersApi = async (query: string, page = 0, size = 20): Promise<PaginatedResponse<UserResponse>> => {
  const response = await apiClient.get("/users/search", { params: { query, page, size } });
  return response as unknown as PaginatedResponse<UserResponse>;
};

export const banUserApi = async (id: number): Promise<void> => {
  const response = await apiClient.put(`/users/${id}/ban`);
  return response as unknown as void;
};

export const updateProfileApi = async (data: UpdateProfileRequest): Promise<UserResponse> => {
  const response = await apiClient.put("/users/update", data);
  return response as unknown as UserResponse;
};
