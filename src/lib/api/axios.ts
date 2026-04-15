import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    ...(process.env.NEXT_PUBLIC_API_KEY && { "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY }),
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

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
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = 
      error.response?.status === 401 || 
      error.response?.data?.httpStatus === 401 ||
      error.response?.data?.errorCode === "TOKEN_EXPIRED";

    if (isUnauthorized && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Bypass Next.js cache to trigger JWT refresh evaluation
        const res = await fetch("/api/auth/session?update=" + Date.now());
        const session = await res.json();

        if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
          throw new Error("Token refresh failed");
        }

        const newToken = session.accessToken;
        
        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return api(originalRequest);
      } catch (err) {
        await signOut({ callbackUrl: "/login?error=SessionExpired", redirect: true });
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
