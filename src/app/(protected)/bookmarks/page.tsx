"use client";

import { useBookmarkedPosts } from "@/features/post/hooks/usePosts";
import PostCard from "@/features/post/components/PostCard";
import MainLayout from "@/components/layout/MainLayout";
import { Bookmark } from "lucide-react";
import { DashboardHeader } from "@/features/users/components/DashboardHeader";

export default function BookmarksPage() {
  const { data: postsPage, isLoading } = useBookmarkedPosts();
  const posts = postsPage?.content || [];

  return (
    <MainLayout>
      {/* Wrapper container stretching to full layout height */}
      <div className="flex flex-col flex-1 min-h-full bg-slate-100">
        
        {/* Page Header */}
        <div className="p-5 sm:p-8 border-b border-slate-100 bg-white sticky top-0 z-30 shrink-0">
          <DashboardHeader 
            title="Bookmarks" 
            description="Posts you've saved to find them easily later."
          />
        </div>

        {/* Feed List Container - Conditionally apply pb-20 only if there are posts */}
        <div className={`flex flex-col flex-1 gap-2 ${posts.length > 0 && !isLoading ? 'pb-20' : ''}`}>
          {isLoading ? (
            <div className="bg-white flex-1 flex flex-col items-center justify-center py-12 text-slate-500 font-medium border-b border-slate-200">
              Loading bookmarks...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white flex-1 flex flex-col items-center justify-center py-20 text-slate-500 border-b border-slate-200">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Bookmark size={32} className="text-slate-300" />
              </div>
              <p className="font-bold text-slate-700 text-xl">No bookmarks yet</p>
              <p className="text-sm text-slate-400 mt-2 max-w-xs text-center">
                When you see a post you want to keep track of, tap the bookmark icon to save it here.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white border-y border-slate-200 shadow-sm">
                <PostCard post={post} />
              </div>
            ))
          )}
        </div>
        
      </div>
    </MainLayout>
  );
}
