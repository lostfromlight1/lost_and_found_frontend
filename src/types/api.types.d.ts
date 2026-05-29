interface BaseResponse<T = void> {
  timestamp: string;
  apiId: string;
  traceId: string;
  message: string;
  data: T; 
}
interface BaseErrorResponse {
  timestamp: string;
  httpStatus: number;
  errorCode: string;
  message: string;
  path: string;
  apiId: string;
  traceId: string;
  validationErrors?: Record<string, string>;
}

interface PaginatedResponse<T> {
  content: T[];
  page: number;          
  size: number;          
  totalElements: number;
  totalPages: number;   
}
