import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    error?: "RefreshAccessTokenError";
    user: {
      id: number;
      email: string;
      displayName: string;
      contactInfo: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: number;
    email: string;
    displayName: string;
    contactInfo: string;
    role: "USER" | "ADMIN";
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: "RefreshAccessTokenError";
    user: {
      id: number;
      email: string;
      displayName: string;
      contactInfo: string;
      role: "USER" | "ADMIN";
    };
  }
}
