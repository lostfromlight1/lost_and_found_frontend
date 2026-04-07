import { AxiosResponse } from "axios";

export interface BaseResponse<T> {
  timestamp: string;
  apiId: string;
  traceId: string;
  message: string;
  data: T;
}

export function getApiPayload<T>(response: AxiosResponse<BaseResponse<T>>): T {
  if (response.data && response.data.data !== undefined) {
    return response.data.data;
  }
  throw new Error(response.data?.message || "An unexpected error occurred");
}
