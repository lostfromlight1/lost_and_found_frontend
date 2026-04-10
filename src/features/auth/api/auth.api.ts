// src/features/auth/api/auth.api.ts

import { apiClient } from "@/lib/api/axios";
import { BaseResponse } from "@/types/api.types";
import {
  ChangePasswordRequest,
  ConfirmPasswordResetRequest,
  LoginRequest,
  RegisterRequest,
} from "./request/auth.request";
import { AuthResponse, UserResponse } from "./response/auth.response";

// POST /api/v1/auth/login
export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<BaseResponse<AuthResponse>>("/auth/login", data);
  return response.data as unknown as AuthResponse; 
};

// POST /api/v1/auth/register
export const registerApi = async (data: RegisterRequest): Promise<UserResponse> => {
  const response = await apiClient.post<BaseResponse<UserResponse>>("/auth/register", data);
  return response.data as unknown as UserResponse;
};

// POST /api/v1/auth/change-password
export const changePasswordApi = async (data: ChangePasswordRequest): Promise<null> => {
  const response = await apiClient.post<BaseResponse<null>>("/auth/change-password", data);
  return response.data as unknown as null;
};

// POST /api/v1/auth/reset-password
export const requestPasswordResetApi = async (email: string): Promise<null> => {
  const response = await apiClient.post<BaseResponse<null>>(`/auth/reset-password`, null, {
    params: { email },
  });
  return response.data as unknown as null;
};

// POST /api/v1/auth/reset-password/confirm
export const confirmPasswordResetApi = async (data: ConfirmPasswordResetRequest): Promise<null> => {
  const response = await apiClient.post<BaseResponse<null>>("/auth/reset-password/confirm", data);
  return response.data as unknown as null;
};

// GET /api/v1/auth/verify-email
export const verifyEmailApi = async (token: string): Promise<null> => {
  const response = await apiClient.get<BaseResponse<null>>(`/auth/verify-email`, {
    params: { token },
  });
  return response.data as unknown as null;
};

// POST /api/v1/auth/resend-verification
export const resendVerificationApi = async (email: string): Promise<null> => {
  const response = await apiClient.post<BaseResponse<null>>(`/auth/resend-verification`, null, {
    params: { email },
  });
  return response.data as unknown as null;
};

// POST /api/v1/auth/logout
export const logoutApi = async (): Promise<null> => {
  const response = await apiClient.post<BaseResponse<null>>("/auth/logout");
  return response.data as unknown as null;
};
