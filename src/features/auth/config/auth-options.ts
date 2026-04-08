import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authApi } from "../api/auth-api";
import axios from "axios"; 

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const authData = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          });

          return {
            id: authData.user.id.toString(),
            email: authData.user.email,
            name: authData.user.displayName,
            accessToken: authData.accessToken,
            role: authData.user.role,
          };
        } catch (error: unknown) {
          console.error("Login failed:", error);
          
          let errorMessage = "Invalid email or password";

          if (axios.isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          throw new Error(errorMessage); 
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
