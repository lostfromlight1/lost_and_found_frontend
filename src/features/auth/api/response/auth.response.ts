export interface UserResponse {
  id: number;
  email: string;
  displayName: string;
  contactInfo?: string | null;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  isLocked?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}
