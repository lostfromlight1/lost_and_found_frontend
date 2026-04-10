// src/types/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: number;
    email: string;
    role: "USER" | "ADMIN";
    displayName: string;
  }

  interface Session {
    user: {
      id: number;
      email: string;
      role: "USER" | "ADMIN";
      name: string; 
    } & DefaultSession["user"];
  }

  interface JWT {
    id: number;
    role: "USER" | "ADMIN";
    displayName: string;
    email: string;
  }
}
