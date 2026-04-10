// src/features/auth/hooks/useAuthActions.ts

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import {
  changePasswordService,
  confirmPasswordResetService,
  loginService,
  logoutService,
  registerService,
  requestPasswordResetService,
  resendVerificationService,
  verifyEmailService,
} from "../services/auth.service";
import {
  ChangePasswordRequest,
  ConfirmPasswordResetRequest,
  LoginRequest,
  RegisterRequest,
} from "../api/request/auth.request";

// Helper to intercept and display backend validation messages
const handleApiError = (error: AxiosError<BaseErrorResponse>) => {
  const validationErrors = error.response?.data?.validationErrors;
  if (validationErrors) {
    Object.values(validationErrors).forEach((msg) => toast.error(msg as string));
  } else {
    toast.error(error.response?.data?.message || "An unexpected error occurred");
  }
};

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginService(data),
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh(); 
    },
    onError: (error: AxiosError<BaseErrorResponse>) => handleApiError(error),
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerService(data),
    onSuccess: () => {
      router.push("/login?registered=true");
    },
    onError: (error: AxiosError<BaseErrorResponse>) => handleApiError(error),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => logoutService(),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePasswordService(data),
    onError: (error: AxiosError<BaseErrorResponse>) => handleApiError(error),
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => requestPasswordResetService(email),
    onError: (error: AxiosError<BaseErrorResponse>) => handleApiError(error),
  });
};

export const useConfirmPasswordReset = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ConfirmPasswordResetRequest) => confirmPasswordResetService(data),
    onSuccess: () => {
      router.push("/login?reset=success");
    },
    onError: (error: AxiosError<BaseErrorResponse>) => handleApiError(error),
  });
};

export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => verifyEmailService(token),
    onSuccess: () => {
      router.push("/login?verified=true");
    },
    onError: (error: AxiosError<BaseErrorResponse>) => handleApiError(error),
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerificationService(email),
    onError: (error: AxiosError<BaseErrorResponse>) => handleApiError(error),
  });
};
