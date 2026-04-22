import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { AuthResponse } from "@/features/auth/api/response/auth.response";
import { LoginRequest } from "@/features/auth/api/request/auth.request";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

type AuthUser = {
  id: number;
  email: string;
  displayName: string;
  contactInfo?: string | null;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  isLocked?: boolean;
};

type ExtendedUser = AuthUser & {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok || !json.data) {
    throw new Error(json.message || "API Error");
  }
  return json.data;
}

let refreshPromise: Promise<JWT> | null = null;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const data = await apiPost<AuthResponse>("/auth/refresh", {
        refreshToken: token.refreshToken,
      });

      token.accessToken = data.accessToken;
      token.refreshToken = data.refreshToken ?? token.refreshToken;
      token.expiresAt = Date.now() + Number(data.expiresIn);
      token.error = undefined;

      return token;
    } catch {
      token.error = "RefreshAccessTokenError";
      return token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("Missing credentials");

        const data = await apiPost<AuthResponse>(
          "/auth/login",
          credentials as LoginRequest
        );

        return {
          ...data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        } as unknown as User;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session?.user) {
        token.user = { ...token.user, ...session.user };
        return token;
      }

      // 1. Google Login: Map backend response to token
      if (account?.provider === "google" && account.id_token) {
        const data = await apiPost<AuthResponse>("/auth/google", { idToken: account.id_token });
        token.accessToken = data.accessToken;
        token.refreshToken = data.refreshToken;
        token.expiresAt = Date.now() + Number(data.expiresIn);
        token.user = data.user; // data.user is AuthUser type
        return token;
      }

      // 2. Credentials Login: Map ExtendedUser to token
      if (user) {
        const u = user as ExtendedUser;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.expiresAt = Date.now() + Number(u.expiresIn);

        // CLEAN FIX: Explicitly map only AuthUser fields. 
        // Prevents u.accessToken and u.refreshToken from being duplicated in token.user.
        token.user = {
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          contactInfo: u.contactInfo,
          role: u.role,
          avatarUrl: u.avatarUrl,
          avatarPublicId: u.avatarPublicId,
          isLocked: u.isLocked,
        };
        return token;
      }

      // 3. Prevent refresh if already failed
      if (token.error === "RefreshAccessTokenError") {
        return token;
      }

      // 4. Proactive Refresh: 30s window to cooperate with Axios interceptor
      const shouldRefresh = token.expiresAt && Date.now() > (token.expiresAt as number) - 30_000;

      if (shouldRefresh) {
        return refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      // Use AuthUser type to satisfy ESLint without using 'any'
      session.user = { 
        ...session.user, 
        ...(token.user as AuthUser) 
      };

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as "RefreshAccessTokenError" | undefined;
      
      return session;
    },
  },
  pages: { signIn: "/login" },
};
