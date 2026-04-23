import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { BaseErrorResponse } from "@/types/api.types";
import {
  createReportService,
  getAllReportsService,
  resolveReportService,
  rejectReportService,
  restoreReportService,
} from "../services/reports.service";
import { CreateReportRequest, ReportActionRequest, ReportFilters } from "../api/request/reports.request";

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as BaseErrorResponse;
    toast.error(data?.message || "An error occurred");
  } else {
    toast.error("An unexpected error occurred");
  }
};

export const useReports = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: () => getAllReportsService(filters),
  });
};

export const useCreateReport = () => {
  return useMutation<void, unknown, CreateReportRequest>({
    mutationFn: (data) => createReportService(data),
    onSuccess: () => toast.success("Report submitted successfully. Thank you."),
    onError: handleApiError,
  });
};

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, { id: number; data: ReportActionRequest }>({
    mutationFn: ({ id, data }) => resolveReportService(id, data),
    onSuccess: () => {
      toast.success("Report resolved.");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: handleApiError,
  });
};

export const useRejectReport = () => {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, { id: number; data: ReportActionRequest }>({
    mutationFn: ({ id, data }) => rejectReportService(id, data),
    onSuccess: () => {
      toast.success("Report rejected.");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: handleApiError,
  });
};

export const useRestoreReport = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number>({
    mutationFn: (id) => restoreReportService(id),
    onSuccess: () => {
      toast.success("Content restored successfully");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => {
      toast.error("Failed to restore content");
    },
  });
};
