// src/features/auth/services/auth.service.ts

import { signIn, signOut } from "next-auth/react";
import {
  changePasswordApi,
  confirmPasswordResetApi,
  logoutApi,
  registerApi,
  requestPasswordResetApi,
  resendVerificationApi,
  verifyEmailApi,
} from "../api/auth.api";
import {
  ChangePasswordRequest,
  ConfirmPasswordResetRequest,
  LoginRequest,
  RegisterRequest,
} from "../api/request/auth.request";

export const loginService = async (data: LoginRequest) => {
  const response = await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false, // Must be false so React Query can catch the success/error
  });

  // NextAuth returns an error string instead of throwing when redirect is false.
  // We throw it so React Query's `onError` can catch it.
  if (response?.error) {
    throw new Error(response.error);
  }
  return response;
};

export const registerService = async (data: RegisterRequest) => {
  return await registerApi(data);
};

export const logoutService = async () => {
  try {
    // 1. Tell Spring Boot to clear the HttpOnly cookies and revoke refresh token
    await logoutApi();
  } catch (error) {
    console.error("Backend logout failed, proceeding with local signout", error);
  } finally {
    // 2. Clear NextAuth UI session and redirect to login
    await signOut({ callbackUrl: "/login" });
  }
};

export const changePasswordService = async (data: ChangePasswordRequest) => {
  return await changePasswordApi(data);
};

export const requestPasswordResetService = async (email: string) => {
  return await requestPasswordResetApi(email);
};

export const confirmPasswordResetService = async (data: ConfirmPasswordResetRequest) => {
  return await confirmPasswordResetApi(data);
};

export const verifyEmailService = async (token: string) => {
  return await verifyEmailApi(token);
};

export const resendVerificationService = async (email: string) => {
  return await resendVerificationApi(email);
};
