import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { signIn, signOut, getSession } from "next-auth/react";
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
        Object.values(validationErrors).forEach((msg) => toast.warning(String(msg)));
      } 
      else {
        toast.warning(message || "We encountered a slight issue. Please try again.");
      }
    } else {
      toast.warning("Network issue. Please check your connection and try again.");
    }
  } else if (error instanceof Error) {
    toast.warning(error.message || "Something went slightly wrong. Please try again.");
  } else {
    toast.warning("An unexpected issue occurred. Please try again.");
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
      // INTERCEPT THE UNVERIFIED ERROR AND REDIRECT
      if (error.message.toLowerCase().includes("verify your email")) {
        toast.error("Please verify your email address to continue.");
        router.push("/verify-email");
      } else {
        toast.warning(error.message || "Invalid email or password");
      }
    },
  });
};

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        const sessionData = await getSession();
        if (sessionData?.refreshToken) {
          await logoutService(sessionData.refreshToken);
        }
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
      toast.success("If the email exists, a reset code has been sent.");
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

// FIXED: Reverted to pushing to /login since the user doesn't have a session yet!
export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => verifyEmailService(token),
    onSuccess: () => {
      toast.success("Email verified successfully! You can now log in.");
      router.push("/login?message=Email verified successfully! Please log in to access your dashboard.");
    },
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
