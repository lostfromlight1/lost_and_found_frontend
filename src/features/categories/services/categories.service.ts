import { CategoryRequest } from "../api/request/categories.request";
import {
  getCategoriesApi,
  createCategoryApi,
  editCategoryApi,
  deleteCategoryApi,
} from "../api/categories.api";

export const getCategoriesService = async () => {
  return await getCategoriesApi();
};

export const createCategoryService = async (data: CategoryRequest) => {
  return await createCategoryApi(data);
};

export const editCategoryService = async (id: number, data: CategoryRequest) => {
  return await editCategoryApi(id, data);
};

export const deleteCategoryService = async (id: number) => {
  return await deleteCategoryApi(id);
};
