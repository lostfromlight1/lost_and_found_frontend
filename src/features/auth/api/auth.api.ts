import { api as apiClient } from "@/lib/api/axios";
import { BaseResponse } from "@/types/api.types";
import {
  ChangePasswordRequest,
  ConfirmPasswordResetRequest,
  LoginRequest,
  RegisterRequest,
} from "./request/auth.request";
import { AuthResponse, UserResponse } from "./response/auth.response";

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<BaseResponse<AuthResponse>>("/auth/login", data);
  return response as unknown as AuthResponse; 
};

export const registerApi = async (data: RegisterRequest): Promise<UserResponse> => {
  const response = await apiClient.post<BaseResponse<UserResponse>>("/auth/register", data);
  return response as unknown as UserResponse;
};

export const changePasswordApi = async (data: ChangePasswordRequest): Promise<void> => {
  await apiClient.post<BaseResponse<void>>("/auth/change-password", data);
};

export const requestPasswordResetApi = async (email: string): Promise<void> => {
  await apiClient.post<BaseResponse<void>>(`/auth/reset-password`, null, {
    params: { email },
  });
};

export const confirmPasswordResetApi = async (data: ConfirmPasswordResetRequest): Promise<void> => {
  await apiClient.post<BaseResponse<void>>("/auth/reset-password/confirm", data);
};

export const verifyEmailApi = async (token: string): Promise<void> => {
  await apiClient.get<BaseResponse<void>>(`/auth/verify-email`, {
    params: { token },
  });
};

export const resendVerificationApi = async (email: string): Promise<void> => {
  await apiClient.post<BaseResponse<void>>(`/auth/resend-verification`, null, {
    params: { email },
  });
};

export const logoutApi = async (refreshToken: string): Promise<void> => {
  await apiClient.post<BaseResponse<void>>("/auth/logout", { refreshToken });
};
