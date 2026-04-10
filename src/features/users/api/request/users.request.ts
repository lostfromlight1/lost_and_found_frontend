export interface UpdateProfileRequest {
  displayName: string;
  contactInfo?: string | null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
