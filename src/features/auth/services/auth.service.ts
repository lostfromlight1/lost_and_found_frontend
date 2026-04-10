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
    redirect: false, 
  });

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
    await logoutApi();
  } catch (error) {
    console.error("Backend logout failed, proceeding with local signout", error);
  } finally {
    await signOut({ callbackUrl: "/" });
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
