import api from "@/lib/api"
import { getApiPayload, BaseResponse } from "@/lib/api-response";
import { LoginRequest, AuthResponse } from "../type/auth-types" ;

export const authApi = {
  // Calls POST /api/v1/auth/login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<BaseResponse<AuthResponse>>(
      "/api/v1/auth/login",
      credentials
    );
    return getApiPayload(response);
  },
};
