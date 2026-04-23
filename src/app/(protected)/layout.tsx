import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/config/auth-options";
import ProtectedLayoutClient from "./ProtectedLayoutClient";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Automatically applies the White Card + Left Sidebar layout to all protected routes
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
