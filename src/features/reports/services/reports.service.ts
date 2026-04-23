import { createReportApi, getAllReportsApi, resolveReportApi, rejectReportApi, restoreReportApi } from "../api/reports.api";
import { CreateReportRequest, ReportActionRequest, ReportFilters } from "../api/request/reports.request";
import { ReportResponseDto, PageResponse } from "../api/response/reports.response";

export const createReportService = async (data: CreateReportRequest): Promise<void> => {
  return await createReportApi(data);
};

export const getAllReportsService = async (filters: ReportFilters): Promise<PageResponse<ReportResponseDto>> => {
  return await getAllReportsApi(filters);
};

export const resolveReportService = async (id: number, data: ReportActionRequest): Promise<void> => {
  return await resolveReportApi(id, data);
};

export const rejectReportService = async (id: number, data: ReportActionRequest): Promise<void> => {
  return await rejectReportApi(id, data);
};

export const restoreReportService = async (id: number): Promise<void> => {
  return await restoreReportApi(id);
};
