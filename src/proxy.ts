import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // If there is a token, the user is authenticated. 
      // You can also add role checks here later (e.g., token?.role === "ADMIN")
      return !!token;
    },
  },
  pages: {
    signIn: "/login", // Redirect unauthenticated users here
  },
});

export const config = {
  // Specify which routes you want to protect. 
  // This matcher protects EVERYTHING inside /dashboard and its sub-paths.
  // Adjust this if your main protected route is just "/" instead of "/dashboard"
  matcher: ["/dashboard/:path*", "/"], 
};
