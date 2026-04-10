import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { signIn, signOut } from "next-auth/react";
import { BaseErrorResponse } from "@/types/api.types";
import {
  changePasswordService,
  confirmPasswordResetService,
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

const handleApiError = (error: AxiosError<BaseErrorResponse> | Error) => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const validationErrors = error.response.data.validationErrors;
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((msg) => toast.error(msg as string));
    } else {
      toast.error(error.response.data.message || "An unexpected error occurred");
    }
  } else {
    toast.error(error.message || "An unexpected error occurred");
  }
};

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Login successful");
      router.push("/dashboard");
      router.refresh(); 
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid credentials");
    },
  });
};

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        await logoutService();
      } catch (e) {
        console.warn("Backend logout failed, but proceeding to clear local session", e);
      }
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh(); 
    },
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerService(data),
    onSuccess: () => {
      router.push("/verify-email");
      toast.success("Registration successful! Please check your email for the verification code.");
    },
    onError: handleApiError,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePasswordService(data),
    onSuccess: () => {
        toast.success("Password changed successfully");
    },
    onError: handleApiError,
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => requestPasswordResetService(email),
    onSuccess: () => {
        toast.success("If the email exists, a reset link has been sent.");
    },
    onError: handleApiError,
  });
};

export const useConfirmPasswordReset = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ConfirmPasswordResetRequest) => confirmPasswordResetService(data),
    onSuccess: () => {
      toast.success("Password reset successful. You can now log in.");
      router.push("/login?reset=success");
    },
    onError: handleApiError,
  });
};

export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => verifyEmailService(token),
    onSuccess: () => {
      toast.success("Email verified successfully!");
      router.push("/login?verified=true");
    },
    onError: handleApiError,
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerificationService(email),
    onSuccess: () => {
        toast.success("Verification email resent.");
    },
    onError: handleApiError,
  });
};
