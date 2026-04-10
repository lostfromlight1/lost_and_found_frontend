// src/features/auth/hooks/useAuthActions.ts

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginService(data),
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh(); // Refresh Next.js layout to pick up new session
    },
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerService(data),
    onSuccess: () => {
      // Redirect to login page so they can log in after verifying their email
      router.push("/login?registered=true");
    },
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
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => requestPasswordResetService(email),
  });
};

export const useConfirmPasswordReset = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ConfirmPasswordResetRequest) => confirmPasswordResetService(data),
    onSuccess: () => {
      router.push("/login?reset=success");
    },
  });
};

export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => verifyEmailService(token),
    onSuccess: () => {
      router.push("/login?verified=true");
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerificationService(email),
  });
};
