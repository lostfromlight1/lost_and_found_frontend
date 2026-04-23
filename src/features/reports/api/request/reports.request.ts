export type ReportTargetType = "POST" | "COMMENT" | "USER";

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  description?: string;
}

export interface ReportActionRequest {
  adminNote?: string;
}

export interface ReportFilters {
  page?: number;
  size?: number;
  status?: string;
  targetType?: string;
}
