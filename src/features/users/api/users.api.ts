import { api as apiClient } from "@/lib/api/axios";
import { PaginatedResponse } from "@/types/api.types";
import { UpdateProfileRequest } from "./request/users.request";
import { UserResponse } from "./response/users.response";

export const getAllUsersApi = async (page = 0, size = 20): Promise<PaginatedResponse<UserResponse>> => {
  return await apiClient.get("/users", { params: { page, size } });
};

export const searchUsersApi = async (query: string, page = 0, size = 20): Promise<PaginatedResponse<UserResponse>> => {
  return await apiClient.get("/users/search", { params: { query, page, size } });
};

export const banUserApi = async (id: number): Promise<void> => {
  return await apiClient.put(`/users/${id}/ban`);
};

export const unbanUserApi = async (id: number): Promise<void> => {
  return await apiClient.put(`/users/${id}/unban`);
};

export const updateProfileApi = async (data: UpdateProfileRequest): Promise<UserResponse> => {
  return await apiClient.put("/users/me", data);
};

// NEW: Avatar Upload API
export const uploadAvatarApi = async (file: File): Promise<UserResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return await apiClient.post("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
