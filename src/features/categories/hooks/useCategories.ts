import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import {
  getCategoriesService,
  createCategoryService,
  editCategoryService,
  deleteCategoryService,
} from "../services/categories.service";
import { CategoryRequest } from "../api/request/categories.request";

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as BaseErrorResponse | undefined;

    if (responseData) {
      const { message, validationErrors } = responseData;

      if (validationErrors && Object.keys(validationErrors).length > 0) {
        Object.values(validationErrors).forEach((msg) =>
          toast.warning(String(msg)),
        );
      } else {
        const lowerMsg = (message || "").toLowerCase();
        if (lowerMsg.includes("already exists")) {
          toast.warning(
            "This category already exists. Please choose a different name.",
          );
        } else if (lowerMsg.includes("not found")) {
          toast.warning(
            "Category not found. It may have already been deleted.",
          );
        } else {
          toast.warning(
            message || "We encountered a slight issue. Please try again.",
          );
        }
      }
    } else {
      toast.warning(
        "Network issue. Please check your connection and try again.",
      );
    }
  } else if (error instanceof Error) {
    toast.warning(
      error.message || "Something went slightly wrong. Please try again.",
    );
  } else {
    toast.warning("An unexpected issue occurred. Please try again.");
  }
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesService,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategoryService,
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: handleApiError,
  });
};

export const useEditCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Unpack the object sent from the UI into the two parameters needed by the service
    mutationFn: (params: { id: number; data: CategoryRequest }) =>
      editCategoryService(params.id, params.data),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: handleApiError,
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategoryService,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: handleApiError,
  });
};
