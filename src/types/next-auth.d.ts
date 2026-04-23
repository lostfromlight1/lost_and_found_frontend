import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: "RefreshAccessTokenError";

    user?: {
      id: number;
      email: string;
      displayName: string;
      contactInfo?: string | null;
      role: "USER" | "ADMIN";
      avatarUrl?: string | null;
      avatarPublicId?: string | null;
      isLocked?: boolean;
      emailVerified?: boolean; 
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: number;
    email: string;
    displayName: string;
    contactInfo?: string | null;
    role: "USER" | "ADMIN";
    avatarUrl?: string | null;
    avatarPublicId?: string | null;
    isLocked?: boolean;
    emailVerified?: boolean; 
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: "RefreshAccessTokenError";

    user?: {
      id: number;
      email: string;
      displayName: string;
      contactInfo?: string | null;
      role: "USER" | "ADMIN";
      avatarUrl?: string | null;
      avatarPublicId?: string | null;
      isLocked?: boolean;
      emailVerified?: boolean; 
    };
  }
}
