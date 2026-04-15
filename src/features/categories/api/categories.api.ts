import { api as apiClient } from "@/lib/api/axios";
import { CategoryRequest } from "./request/categories.request";
import { CategoryResponse } from "./response/categories.response";

export const getCategoriesApi = async (): Promise<CategoryResponse[]> => {
  return await apiClient.get("/categories");
};

export const createCategoryApi = async (data: CategoryRequest): Promise<CategoryResponse> => {
  return await apiClient.post("/categories", data);
};

export const editCategoryApi = async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
  return await apiClient.put(`/categories/${id}`, data);
};

export const deleteCategoryApi = async (id: number): Promise<void> => {
  return await apiClient.delete(`/categories/${id}`);
};
