// src/lib/api/axios.ts

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { BaseErrorResponse } from "@/types/api.types";

interface FailedRequestQueue {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "your-default-dev-key",
  },
});

let isRefreshing = false;
let failedQueue: FailedRequestQueue[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.method !== "get" && response.data?.message) {
      toast.success(response.data.message as string);
    }
    if (response.data && Object.prototype.hasOwnProperty.call(response.data, "data")) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError<BaseErrorResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 400 && data?.validationErrors) {
      return Promise.reject(error);
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (
        originalRequest.url?.includes("/auth/refresh") || 
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/logout")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        try {
          await signOut({ callbackUrl: "/login?error=session_expired" });
        } catch (signOutError) {
          console.error("Error during 401 logout:", signOutError);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const errorMessage = data?.message || error.message || "An unexpected error occurred";
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);
