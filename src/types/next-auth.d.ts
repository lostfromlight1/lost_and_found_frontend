import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // Extending the built-in Session type
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  // Extending the built-in User type
  interface User extends DefaultUser {
    id: string;
    role: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  // Extending the built-in JWT type
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    accessToken: string;
  }
}
