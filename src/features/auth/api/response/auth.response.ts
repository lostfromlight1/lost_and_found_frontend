// src/features/auth/api/response/auth.response.ts

export interface UserResponse {
  id: number;
  email: string;
  displayName: string;
  contactInfo?: string | null;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}
