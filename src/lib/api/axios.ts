import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    ...(process.env.NEXT_PUBLIC_API_KEY && {
      "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY,
    }),
  },
});

let isRefreshing = false;
type SubscriberCallback = (token: string | null) => void;
let subscribers: SubscriberCallback[] = [];

const subscribe = (cb: SubscriberCallback) => {
  subscribers.push(cb);
};

const notify = (token: string | null) => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

const isProtectedPath = (pathname: string) => {
  return (
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/bookmarks") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/admin")
  );
};

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => (res.data?.data !== undefined ? res.data.data : res.data),
  async (error: AxiosError<BaseErrorResponse>) => {
    if (!error.config) return Promise.reject(error);

    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isUnauthorized =
      error.response?.status === 401 ||
      error.response?.data?.httpStatus === 401 ||
      error.response?.data?.errorCode === "TOKEN_EXPIRED";

    if (isUnauthorized && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribe((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            } else {
              reject(new Error("Session expired"));
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const session = await getSession();
        const currentToken = session?.accessToken;
        const failedToken = original.headers.Authorization
          ?.toString()
          .replace("Bearer ", "");

        if (currentToken && currentToken !== failedToken) {
          notify(currentToken);
          original.headers.Authorization = `Bearer ${currentToken}`;
          return api(original);
        }

        const res = await fetch(`/api/auth/session?update=${Date.now()}`);
        const updatedSession = (await res.json()) as {
          accessToken?: string;
          error?: string;
        };

        if (!updatedSession?.accessToken || updatedSession.error) {
          throw new Error("Refresh failed");
        }

        notify(updatedSession.accessToken);
        original.headers.Authorization = `Bearer ${updatedSession.accessToken}`;
        return api(original);
      } catch (err) {
        notify(null);

        const pathname =
          typeof window !== "undefined" ? window.location.pathname : "";

        if (isProtectedPath(pathname)) {
          await signOut({ callbackUrl: "/login?error=SessionExpired" });
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);