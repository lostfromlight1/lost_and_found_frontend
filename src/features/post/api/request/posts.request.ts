export interface ImageUploadRequest {
  url: string;
  publicId: string;
  sortOrder?: number;
}

export interface CreatePostRequest {
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  categoryId: number;
  location: string; 
  lostFoundDate: string; 
  contactInfo: string;
  reward?: number; 
  images?: ImageUploadRequest[];
}

export interface UpdatePostRequest extends CreatePostRequest {
  status: "OPEN" | "CLOSE";
}

export interface PostFilters {
  page?: number;
  size?: number;
  type?: "LOST" | "FOUND";
  categoryId?: number;
  location?: string;
}
