// src/features/users/api/response/user.response.ts
export interface UserResponse {
  id: number;
  email: string;
  displayName: string;
  contactInfo?: string | null;
  role: "USER" | "ADMIN";
}

export interface PaginatedUserResponse {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
