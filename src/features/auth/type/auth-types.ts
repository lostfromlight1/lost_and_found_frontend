// Mirrors com.lostandfound.app.dto.response.UserResponse
export interface UserResponse {
  id: number; 
  email: string;
  displayName: string;
  contactInfo?: string;
  role: string;
}

// Mirrors com.lostandfound.app.dto.response.AuthResponse
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

// Mirrors com.lostandfound.app.dto.request.AuthRequest.LoginRequest
export interface LoginRequest {
  email: string;
  password: string;
}

// Mirrors com.lostandfound.app.dto.request.AuthRequest.RegisterRequest
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  contactInfo?: string;
}
