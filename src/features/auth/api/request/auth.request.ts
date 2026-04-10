// src/features/auth/api/request/auth.request.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  contactInfo?: string; 
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ConfirmPasswordResetRequest {
  token: string;
  newPassword: string;
}
