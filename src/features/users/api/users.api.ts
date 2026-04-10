import { api as apiClient } from "@/lib/api/axios";
import { PaginatedResponse } from "@/types/api.types";
import { UserResponse } from "@/features/auth/api/response/auth.response";
import { UpdateProfileRequest } from "./request/users.request";

export const getAllUsersApi = async (page = 0, size = 20): Promise<PaginatedResponse<UserResponse>> => {
  return await apiClient.get("/users", { params: { page, size } });
};

export const searchUsersApi = async (query: string, page = 0, size = 20): Promise<PaginatedResponse<UserResponse>> => {
  return await apiClient.get("/users/search", { params: { query, page, size } });
};

export const banUserApi = async (id: number): Promise<void> => {
  await apiClient.put(`/users/${id}/ban`);
};

export const updateProfileApi = async (data: UpdateProfileRequest): Promise<UserResponse> => {
  return await apiClient.put("/users/update", data);
};
