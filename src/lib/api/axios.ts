import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    ...(process.env.NEXT_PUBLIC_API_KEY && { "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY }),
  },
});

api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined ? response.data.data : response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await getSession();

        if (session?.accessToken && !session.error) {
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        console.error("Failed to refresh session mid-request", e);
      }

      await signOut({ callbackUrl: "/login" });
    }

    return Promise.reject(error);
  }
);
