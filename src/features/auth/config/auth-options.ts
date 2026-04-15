import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

interface BackendAuthData {
  id: number;
  email: string;
  displayName: string;
  contactInfo: string;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isLocked?: boolean;
}

type SessionUser = Omit<BackendAuthData, "accessToken" | "refreshToken" | "expiresIn">;

let refreshPromise: Promise<JWT> | null = null;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": API_KEY,
        },
        body: JSON.stringify({ refreshToken: token.refreshToken })
      });

      const refreshedTokens = await response.json();

      if (!response.ok || !refreshedTokens.data) {
        throw new Error("RefreshAccessTokenError");
      }

      const { accessToken, refreshToken, expiresIn } = refreshedTokens.data;

      return {
        ...token,
        accessToken: accessToken,
        refreshToken: refreshToken ?? token.refreshToken,
        expiresAt: Date.now() + Number(expiresIn), 
      } as JWT;
    } catch {
      return {
        ...token,
        error: "RefreshAccessTokenError",
      } as JWT;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: { timeout: 10000 },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(credentials) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-KEY": API_KEY },
          body: JSON.stringify(credentials),
        });
        
        const json = await res.json();
        
        if (res.ok && json.data) {
          const { accessToken, refreshToken, expiresIn, user } = json.data;
          return {
            ...user,
            id: Number(user.id),
            accessToken,
            refreshToken,
            expiresIn: Number(expiresIn),
          } as unknown as User;
        }
        throw new Error(json.message || "Invalid credentials");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      
      // 1. Handle manual session updates (Profile changes / Avatar uploads)
      if (trigger === "update" && session) {
        token.user = { 
          ...(token.user as SessionUser), 
          ...(session.user || session) 
        };
        return token;
      }

      // 2. Google Login
      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json", 
              "X-API-KEY": API_KEY 
            },
            body: JSON.stringify({ idToken: account.id_token }),
          });

          const json = await res.json();

          if (res.ok && json.data) {
            const { accessToken, refreshToken, expiresIn, user: backendUser } = json.data;
            return {
              ...token,
              accessToken,
              refreshToken,
              expiresAt: Date.now() + Number(expiresIn),
              user: {
                id: Number(backendUser.id),
                email: backendUser.email,
                displayName: backendUser.displayName,
                contactInfo: backendUser.contactInfo || "",
                role: backendUser.role,
                avatarUrl: backendUser.avatarUrl,
                avatarPublicId: backendUser.avatarPublicId,
                isLocked: backendUser.isLocked,
              }
            } as JWT;
          } else {
             throw new Error("OAuthAccountCollision");
          }
        } catch { 
          throw new Error("OAuthCallbackError"); 
        }
      }

      // 3. Credentials Login
      if (user) {
        const customUser = user as unknown as BackendAuthData;
        return {
          ...token,
          accessToken: customUser.accessToken,
          refreshToken: customUser.refreshToken,
          expiresAt: Date.now() + Number(customUser.expiresIn),
          user: { ...customUser },
        } as JWT;
      }

      // 4. Silent Refresh Logic
      if (Date.now() < (token.expiresAt as number) - 60000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = { ...session.user, ...(token.user as SessionUser) };
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as "RefreshAccessTokenError" | undefined;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
