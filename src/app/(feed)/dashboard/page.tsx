import PostFeed from "@/features/post/components/PostFeed";

export default async function DashboardPage() {
  return (
    // PostFeed handles the Left Sidebar, Middle Feed, and Right Sidebar layout completely
    <PostFeed />
  );
}
