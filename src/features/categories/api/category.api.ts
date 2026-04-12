import { api as apiClient } from "@/lib/api/axios";
import { BaseResponse } from "@/types/api.types";
import { CategoryRequest } from "./request/categories.request";
import { CategoryResponse } from "./response/categories.response";

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const response = await apiClient.get<BaseResponse<CategoryResponse[]>>("/category");
  return response.data as unknown as CategoryResponse[];
};

export const createCategory = async (data: CategoryRequest): Promise<CategoryResponse> => {
  const response = await apiClient.post<BaseResponse<CategoryResponse>>("/category", data);
  return response.data as unknown as CategoryResponse;
};

export const editCategory = async (params: { id: number; data: CategoryRequest }): Promise<CategoryResponse> => {
  const response = await apiClient.post<BaseResponse<CategoryResponse>>(`/category/edit/${params.id}`, params.data);
  return response.data as unknown as CategoryResponse;
};

export const deleteCategory = async (id: number): Promise<void> => {
  const response = await apiClient.delete<BaseResponse<void>>(`/category/${id}`);
  return response.data as unknown as void;
};
