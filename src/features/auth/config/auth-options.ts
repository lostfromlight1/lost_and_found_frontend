// src/features/auth/config/auth-options.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "text" }, 
      },

      async authorize(credentials) {
        // ----------------------------------------------------------------
        // PATH A: SILENT SYNC (Used after Google OAuth redirect)
        // ----------------------------------------------------------------
        if (credentials?.action === "sync") {
          try {
            const res = await fetch(`${API_URL}/users/me`, {
              method: "GET",
              headers: {
                "Accept": "application/json",
                "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "your-default-dev-key",
              },
              credentials: "include", // Sends the Google cookies!
            });

            if (!res.ok) return null;

            const responseData = await res.json();
            const userData = responseData.data;

            return {
              id: Number(userData.id),
              email: userData.email,
              role: userData.role as "USER" | "ADMIN",
              displayName: userData.displayName,
            };
          } catch {
            return null;
          }
        }

        // ----------------------------------------------------------------
        // PATH B: NORMAL EMAIL/PASSWORD LOGIN
        // ----------------------------------------------------------------
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "your-default-dev-key",
            },
            credentials: "include", 
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const responseData = await res.json();

          if (!res.ok) {
            throw new Error(responseData.message || "Invalid email or password");
          }

          const authData = responseData.data;

          return {
            id: Number(authData.user.id),
            email: authData.user.email,
            role: authData.user.role as "USER" | "ADMIN",
            displayName: authData.user.displayName,
          };
        } catch (error) {
          if (error instanceof Error) throw new Error(error.message);
          throw new Error("Login failed");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.displayName = user.displayName;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as number;
      session.user.role = token.role as "USER" | "ADMIN";
      session.user.name = token.displayName as string;
      session.user.email = token.email as string;
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 15 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
