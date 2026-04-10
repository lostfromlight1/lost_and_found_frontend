import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

// An internal interface that DOES NOT extend User to avoid type collisions
interface BackendAuthData {
  id: number;
  email: string;
  displayName: string;
  contactInfo: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY, 
        "Cookie": `app_refresh_token=${token.refreshToken}` 
      },
    });

    const refreshedTokens = await response.json();

    if (!response.ok || !refreshedTokens.data) {
      throw new Error("Failed to refresh token");
    }

    const { accessToken, refreshToken, expiresIn } = refreshedTokens.data;

    return {
      ...token,
      accessToken: accessToken,
      refreshToken: refreshToken ?? token.refreshToken,
      // FIXED: Removed * 1000 since expiresIn is already in milliseconds
      expiresAt: Date.now() + expiresIn,
    } as JWT;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    } as JWT;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "X-API-KEY": API_KEY 
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const json = await res.json();

          if (res.ok && json.data) {
            const { accessToken, refreshToken, expiresIn, user } = json.data;
            
            // Cast to unknown then User to safely bypass strict type collision,
            // mapping exactly to your next-auth.d.ts (id as number, contactInfo as string)
            return {
              id: Number(user.id),
              email: user.email,
              displayName: user.displayName,
              contactInfo: user.contactInfo || "", 
              role: user.role,
              accessToken,
              refreshToken,
              expiresIn,
            } as unknown as User; 
          }
          
          console.error("Login rejected by backend:", json.message);
          return null;
        } catch (error) {
          console.error("Login authorization fetch error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // 1. Handle Google Login Bridge
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
              // FIXED: Removed * 1000
              expiresAt: Date.now() + expiresIn,
              user: {
                id: Number(backendUser.id),
                email: backendUser.email,
                displayName: backendUser.displayName,
                contactInfo: backendUser.contactInfo || "",
                role: backendUser.role,
              }
            } as JWT;
          } else {
             console.error("Backend rejected Google token:", json.message);
             return { ...token, error: "RefreshAccessTokenError" } as JWT;
          }
        } catch (error) {
          console.error("Google backend auth fetch error:", error);
          return { ...token, error: "RefreshAccessTokenError" } as JWT; 
        }
      }

      // 2. Handle Standard Login Bridge
      if (user) {
        // Cast via unknown to our internal interface to extract our custom data 
        // without triggering ESLint 'any' or TS interface collision warnings
        const customUser = user as unknown as BackendAuthData; 
        
        return {
          ...token,
          accessToken: customUser.accessToken,
          refreshToken: customUser.refreshToken,
          // FIXED: Removed * 1000
          expiresAt: Date.now() + customUser.expiresIn,
          user: {
            id: customUser.id,
            email: customUser.email,
            displayName: customUser.displayName,
            contactInfo: customUser.contactInfo,
            role: customUser.role,
          },
        } as JWT; 
      }

      // 3. Handle Token Refresh
      if (Date.now() < (token.expiresAt as number) - 10000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Safely map JWT properties to the Session object
      session.user = token.user as User;
      session.accessToken = token.accessToken as string;
      session.error = token.error as "RefreshAccessTokenError" | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
