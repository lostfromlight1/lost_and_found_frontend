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
}

export interface PostResponseDto {
  id: number;
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  status: "OPEN" | "CLOSE";
  location: string;
  lostFoundDate: string;
  contactInfo: string;
  reward: number;
  user: UserSummaryDto;
  category: CategoryDto;
  images: ImageDto[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
