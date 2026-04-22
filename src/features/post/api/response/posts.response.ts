export interface ImageDto {
  id: number;
  url: string;
  sortOrder: number;
}

export interface CategoryDto {
  id: number;
  name: string;
}

export interface UserSummaryDto {
  id: number;
  displayName: string;
  avatarUrl?: string;
  email: string; 
}

export interface PostResponseDto {
  id: number;
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  status: "OPEN" | "CLOSE" | "RESOLVED"; 
  city: string;
  locationDetails: string;
  latitude: number;  
  longitude: number;
  lostFoundDate: string; 
  createdAt: string; 
  contactInfo: string;
  reward: number | null; 
  user: UserSummaryDto;
  category: CategoryDto;
  images: ImageDto[];
  LikeCount: number; 
  liked: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
