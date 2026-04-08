import axios from "axios";
import { getApiPayload, BaseResponse } from "@/lib/api-response";
import { LoginRequest, AuthResponse } from "../type/auth-types" ;

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {

    const response = await axios.post<BaseResponse<AuthResponse>>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
      credentials,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    
    return getApiPayload(response);
  },
};
