import axios, { InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (request: InternalAxiosRequestConfig) => {
  if (!isAccessTokenAttachedToAxiosDefaults()) {
    await setAccessTokenOnRequestAndAsAxiosDefaults(request);
  }
  return request;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.method !== "get" && response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      try {
        await signOut({ callbackUrl: "/login" });
        unsetAccessTokenAttachedToAxiosDefaults();
      } catch (err) {
        console.error("Error during 401 logout:", err);
        throw new error ;
        
      }
    } else {
      const errorMessage =
        data?.message || data?.error || error.message || "An unexpected error occurred";
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

const isAccessTokenAttachedToAxiosDefaults = () => {
  const authHeader = api.defaults.headers.common["Authorization"];
  return !!(authHeader && authHeader !== "");
};

const setAccessTokenOnRequestAndAsAxiosDefaults = async (
  request: InternalAxiosRequestConfig
) => {
  const session = await getSession();
  if (session?.accessToken) {
    const authHeaderValue = `Bearer ${session.accessToken}`;
    request.headers.set("Authorization", authHeaderValue);
    api.defaults.headers.common["Authorization"] = authHeaderValue;
  }
};

export const unsetAccessTokenAttachedToAxiosDefaults = () => {
  delete api.defaults.headers.common["Authorization"];
};

export default api;
