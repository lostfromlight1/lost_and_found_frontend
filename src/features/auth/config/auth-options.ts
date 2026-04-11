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
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

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
          "Cookie": `app_refresh_token=${token.refreshToken}` 
        },
        body: JSON.stringify({ refreshToken: token.refreshToken })
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
        expiresAt: Date.now() + Number(expiresIn),
      } as JWT;
    } catch (error) {
      console.log("Session expired or invalid. Forcing re-login.", error);
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
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      httpOptions: {
        timeout: 10000, 
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

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
            return {
              id: Number(user.id),
              email: user.email,
              displayName: user.displayName,
              contactInfo: user.contactInfo || "", 
              role: user.role,
              accessToken,
              refreshToken,
              expiresIn: Number(expiresIn),
            } as unknown as User; 
          }
          
          throw new Error(json.message || "Invalid email or password");
          
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Unable to connect to the server.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
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
              // CRITICAL FIX: Wrap in Number()
              expiresAt: Date.now() + Number(expiresIn),
              user: {
                id: Number(backendUser.id),
                email: backendUser.email,
                displayName: backendUser.displayName,
                contactInfo: backendUser.contactInfo || "",
                role: backendUser.role,
              }
            } as JWT;
          } else {
             throw new Error("OAuthAccountCollision");
          }
        } catch (error) {
          throw new Error("OAuthCallbackError: "); 
        }
      }

      if (user) {
        const customUser = user as unknown as BackendAuthData; 
        
        return {
          ...token,
          accessToken: customUser.accessToken,
          refreshToken: customUser.refreshToken,
          // CRITICAL FIX: Wrap in Number()
          expiresAt: Date.now() + Number(customUser.expiresIn),
          user: {
            id: customUser.id,
            email: customUser.email,
            displayName: customUser.displayName,
            contactInfo: customUser.contactInfo,
            role: customUser.role,
          },
        } as JWT; 
      }

      if (Date.now() < (token.expiresAt as number) - 10000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
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
