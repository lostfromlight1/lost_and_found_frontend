import {
  changePasswordApi,
  confirmPasswordResetApi,
  loginApi,
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
  return await loginApi(data);
};

export const registerService = async (data: RegisterRequest) => {
  return await registerApi(data);
};

export const logoutService = async () => {
  return await logoutApi();
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
