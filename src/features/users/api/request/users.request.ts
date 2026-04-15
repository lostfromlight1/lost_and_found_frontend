export interface UpdateProfileRequest {
  displayName: string;
  contactInfo?: string | null;
  avatarUrl?: string | null;     
  avatarPublicId?: string | null; 
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
