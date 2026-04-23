import { api as apiClient } from "@/lib/api/axios";
import { CreateReportRequest, ReportActionRequest, ReportFilters } from "./request/reports.request";
import { ReportResponseDto, PageResponse } from "./response/reports.response";

export const createReportApi = async (data: CreateReportRequest): Promise<void> => {
  return await apiClient.post("/reports", data);
};

export const getAllReportsApi = async (filters: ReportFilters): Promise<PageResponse<ReportResponseDto>> => {
  return await apiClient.get("/reports", { params: filters });
};

export const resolveReportApi = async (id: number, data: ReportActionRequest): Promise<void> => {
  return await apiClient.post(`/reports/${id}/resolve`, data);
};

export const rejectReportApi = async (id: number, data: ReportActionRequest): Promise<void> => {
  return await apiClient.post(`/reports/${id}/reject`, data);
};

export const restoreReportApi = async (id: number): Promise<void> => {
  return await apiClient.post(`/reports/${id}/restore`);
};
