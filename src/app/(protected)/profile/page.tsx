"use client";

import { useSession } from "next-auth/react";
import { useUserPosts } from "@/features/post/hooks/usePosts";
import PostCard from "@/features/post/components/PostCard";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, MapPin, Mail } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  
  // Explicitly cast to any to safely extract custom token parameters 
  const user = session?.user as any;
  const userId = Number(user?.id);

  const { data: postsPage, isLoading } = useUserPosts(userId);
  const posts = postsPage?.content || [];

  if (!user) return null;

  return (
    <MainLayout>
      {/* Profile Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-8 sm:px-10 sm:py-12 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-md rounded-full overflow-hidden shrink-0">
          <AvatarImage src={user.image || user.avatarUrl || undefined} className="object-cover w-full h-full" />
          <AvatarFallback className="bg-slate-100 text-slate-600 text-3xl font-bold flex items-center justify-center w-full h-full">
            {user.name?.charAt(0).toUpperCase() || user.displayName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left mt-2 sm:mt-4 w-full">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {user.name || user.displayName}
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <Mail size={14} className="text-slate-400" /> {user.email}
            </span>
            {user.contactInfo && (
              <span className="flex items-center gap-1.5 text-sm text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <MapPin size={14} className="text-[#1d9bf0]" /> {user.contactInfo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Feed Filter Tab */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-slate-100 flex items-center shrink-0">
        <div className="px-6 hover:bg-slate-50 transition-colors font-bold text-[15px] pt-4 pb-3 relative text-slate-900 cursor-pointer">
          My Posts
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-t-sm" />
        </div>
      </div>

      {/* Feed List */}
      <div className="flex flex-col pb-20 shrink-0 bg-slate-100 gap-2">
        {isLoading ? (
          <div className="bg-white text-center py-12 text-slate-500 font-medium">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white text-center py-20 text-slate-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <FileText size={32} className="text-slate-300" />
            </div>
            <p className="font-bold text-slate-700 text-xl">No posts yet</p>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              When you create a lost or found post, it will appear here on your profile.
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
    </MainLayout>
  );
}
