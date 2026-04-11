import { api } from "@/lib/api/axios";

export interface CategoryResponse {
  id: number;
  name: string;
}

export interface CategoryRequest {
  name: string;
}

export const getCategories = async (): Promise<CategoryResponse[]> => {
  return api.get("/category");
};

export const createCategory = async (data: CategoryRequest): Promise<CategoryResponse> => {
  return api.post("/category", data);
};

export const editCategory = async (params: { id: number; data: CategoryRequest }): Promise<CategoryResponse> => {
  return api.post(`/category/edit/${params.id}`, params.data);
};

export const deleteCategory = async (id: number): Promise<void> => {
  return api.delete(`/category/${id}`);
};
