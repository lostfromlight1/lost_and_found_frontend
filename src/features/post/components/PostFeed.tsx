"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Image as ImageIcon, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "use-debounce";
import { usePosts } from "../hooks/usePosts";
import { useCategories } from "@/features/categories/hooks/useCategories";

import PostCard from "./PostCard";
import PostFormModal from "./PostFormModal";
import RightSidebar from "@/components/layout/RightSidebar";
import MainLayout from "@/components/layout/MainLayout";

interface CategoryItem { id: number; name: string; }

export default function PostFeed() {
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Filter States
  const [type, setType] = useState<"LOST" | "FOUND" | "ALL">("ALL");
  const [city, setCity] = useState<string>("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [locationDetails, setLocationDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [debouncedLocation] = useDebounce(locationDetails, 500);

  // API Hooks
  const { data: categoriesData } = useCategories();
  const safeCategoriesData = categoriesData as unknown as { content?: CategoryItem[]; data?: CategoryItem[] };
  const categoriesList: CategoryItem[] = Array.isArray(categoriesData) 
    ? categoriesData : safeCategoriesData?.content || safeCategoriesData?.data || [];

  const activeFilters = {
    page: 0, 
    size: 20,
    ...(type !== "ALL" && { type: type as "LOST" | "FOUND" }),
    ...(city !== "ALL" && { city }),
    ...(categoryId !== "ALL" && { categoryId: Number(categoryId) }),
    ...(debouncedLocation.trim() && { locationDetails: debouncedLocation.trim() }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };
  
  const { data: postsPage, isLoading } = usePosts(activeFilters);
  const posts = postsPage?.content || [];

  return (
    <>
      <MainLayout 
        onPostClick={() => setIsCreateModalOpen(true)}
        rightSidebar={
          <RightSidebar 
            type={type} setType={setType}
            city={city} setCity={setCity}
            categoryId={categoryId} setCategoryId={setCategoryId}
            locationDetails={locationDetails} setLocationDetails={setLocationDetails}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            categoriesList={categoriesList}
          />
        }
      >
        {/* Top Tabs */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-slate-100 flex items-center cursor-pointer shrink-0">
          <div className="flex-1 hover:bg-slate-50 transition-colors text-center font-bold text-[15px] pt-4 pb-3 relative">
            Latest
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full" />
          </div>
          <div className="flex-1 hover:bg-slate-50 transition-colors text-center font-medium text-slate-500 text-[15px] pt-4 pb-3">
            Top Posts
          </div>
        </div>

        {/* Quick Post Input Area */}
        <div className="flex gap-4 p-5 border-b border-slate-100 shrink-0 bg-white">
          <Avatar className="w-10 h-10 shrink-0 border border-slate-100">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex flex-col">
            <input 
              type="text" 
              placeholder="What did you lose or find?!" 
              readOnly
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full text-[20px] outline-none bg-transparent placeholder:text-slate-500 mt-1 mb-3 cursor-text"
            />
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2 text-[#1d9bf0] -ml-2">
                  <button onClick={() => setIsCreateModalOpen(true)} className="p-2 hover:bg-blue-50 rounded-full cursor-pointer transition-colors">
                    <ImageIcon size={20} />
                  </button>
                  <button onClick={() => setIsCreateModalOpen(true)} className="p-2 hover:bg-blue-50 rounded-full cursor-pointer transition-colors">
                    <MapPin size={20} />
                  </button>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#1d9bf0] text-white px-5 py-1.5 rounded-full font-bold text-[14px] hover:bg-[#1a8cd8] transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Feed List */}
        <div className="flex flex-col pb-20 shrink-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 font-medium">Loading feed...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">No posts found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            posts.map((post) => (<PostCard key={post.id} post={post} />))
          )}
        </div>
      </MainLayout>

      {/* We keep the Modal outside the layout tree so it can trigger properly */}
      <PostFormModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </>
  );
}
