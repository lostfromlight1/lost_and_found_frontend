import { ReportTargetType } from "../request/reports.request";

export type ReportStatus = "PENDING" | "RESOLVED" | "REJECTED";

export interface ReportResponseDto {
  id: number;
  reportedByName: string;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
