import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
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

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as BaseErrorResponse | undefined;

    if (responseData) {
      const { message, validationErrors } = responseData;

      if (validationErrors && Object.keys(validationErrors).length > 0) {
        Object.values(validationErrors).forEach((msg) => toast.error(String(msg)));
      } 
      else {
        toast.error(message || "An unexpected server error occurred");
      }
    } else {
      toast.error(error.message || "Network error. Unable to connect to the server.");
    }
  } else if (error instanceof Error) {
    toast.error(error.message || "An unexpected error occurred");
  } else {
    toast.error("An unknown error occurred");
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
      toast.error(error.message || "Invalid email or password");
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
      toast.success("Registration successful! Please check your email for the verification code.");
      router.push("/verify-email");
    },
    onError: handleApiError,
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePasswordService(data),
    onSuccess: () => {
      toast.success("Password changed successfully.");
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
  return useMutation({
    mutationFn: (token: string) => verifyEmailService(token),
    onError: handleApiError,
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerificationService(email),
    onSuccess: () => {
      toast.success("A new verification code has been sent to your email.");
    },
    onError: handleApiError,
  });
};
