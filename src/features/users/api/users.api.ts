// src/features/users/api/users.api.ts

import { apiClient } from "@/lib/api/axios";
import { UserResponse } from "@/features/auth/api/response/auth.response";

// GET /api/v1/users/me
export const getCurrentUserApi = async (): Promise<UserResponse> => {
  const response = await apiClient.get("/users/me");
  return response.data as unknown as UserResponse;
};
