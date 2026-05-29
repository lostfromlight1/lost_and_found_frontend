// src/utils/actionHandler.ts
type ActionResult<T> =
  | { success: true; data: T; message: string }
  | { success: false; error: BaseErrorResponse };

export async function actionHandler<T>(
  apiFn: () => Promise<BaseResponse<T>>
): Promise<ActionResult<T>> {
  try {
    const response = await apiFn();
    return {
      success: true,
      data: response.data,
      message: response.message,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: parseError(err),
    };
  }
}

export async function paginatedActionHandler<T>(
  apiFn: () => Promise<BaseResponse<PaginatedResponse<T>>>
): Promise<ActionResult<PaginatedResponse<T>>> {
  return actionHandler(apiFn);
}

interface AxiosErrorShape {
  response?: {
    data?: unknown;
  };
}

function isAxiosError(err: unknown): err is AxiosErrorShape {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err
  );
}

function isBaseErrorResponse(data: unknown): data is BaseErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "errorCode" in data &&
    "httpStatus" in data &&
    "message" in data
  );
}

function parseError(err: unknown): BaseErrorResponse {
  if (isAxiosError(err) && isBaseErrorResponse(err.response?.data)) {
    return err.response.data;
  }

  return {
    timestamp: new Date().toISOString(),
    httpStatus: 500,
    errorCode: "UNKNOWN_ERROR",
    message: err instanceof Error ? err.message : "An unknown error occurred",
    path: "",
    apiId: "",
    traceId: "",
  };
}
