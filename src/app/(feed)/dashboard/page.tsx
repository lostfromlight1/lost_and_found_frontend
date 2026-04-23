import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/config/auth-options";
import PostFeed from "@/features/post/components/PostFeed";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    // PostFeed handles the Left Sidebar, Middle Feed, and Right Sidebar layout completely
    <PostFeed />
  );
}
