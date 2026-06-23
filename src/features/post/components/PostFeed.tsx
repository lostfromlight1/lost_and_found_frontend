"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Image as ImageIcon,
  MapPin,
  Clock3,
  TrendingUp,
  SquarePen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "use-debounce";
import { usePosts } from "../hooks/usePosts";
import { useCategories } from "@/features/categories/hooks/useCategories";

import PostCard from "./PostCard";
import PostFormModal from "./PostFormModal";
import RightSidebar from "@/components/layout/RightSidebar";
import MainLayout from "@/components/layout/MainLayout";

interface CategoryItem {
  id: number;
  name: string;
}

export default function PostFeed() {
  const { data: session } = useSession();

  const [isLocalCreateModalOpen, setIsLocalCreateModalOpen] = useState(false);

  const [feedTab, setFeedTab] = useState<"LATEST" | "TOP">("LATEST");
  const [type, setType] = useState<"LOST" | "FOUND" | "ALL">("ALL");
  const [city, setCity] = useState<string>("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [locationDetails, setLocationDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [debouncedLocation] = useDebounce(locationDetails, 500);

  const { data: categoriesData } = useCategories();
  const safeCategoriesData = categoriesData as unknown as {
    content?: CategoryItem[];
    data?: CategoryItem[];
  };

  const categoriesList: CategoryItem[] = Array.isArray(categoriesData)
    ? categoriesData
    : safeCategoriesData?.content || safeCategoriesData?.data || [];

  const activeFilters = {
    page: 0,
    size: 20,
    sortBy: feedTab,
    ...(type !== "ALL" && { type: type as "LOST" | "FOUND" }),
    ...(city !== "ALL" && { city }),
    ...(categoryId !== "ALL" && { categoryId: Number(categoryId) }),
    ...(debouncedLocation.trim() && {
      locationDetails: debouncedLocation.trim(),
    }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: postsPage, isLoading } = usePosts(activeFilters);
  const posts = postsPage?.content || [];

  const visiblePosts = posts.filter(
    (post) =>
      post.status?.toUpperCase() !== "HIDDEN" &&
      !(post as typeof post & { hidden?: boolean }).hidden,
  );

  return (
    <>
      <MainLayout
        rightSidebar={
          <RightSidebar
            type={type}
            setType={setType}
            city={city}
            setCity={setCity}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            locationDetails={locationDetails}
            setLocationDetails={setLocationDetails}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            categoriesList={categoriesList}
          />
        }
      >
        <div className="min-h-full bg-background">
          <div className="mx-auto flex min-h-full max-w-3xl flex-col px-3 pb-12 pt-4 sm:px-5">
            <div className="sticky top-0 z-30 mb-4 bg-background/70 pb-2 pt-1 backdrop-blur-md">
              <div className="rounded-[18px] border border-[#b7cfb2] bg-[#edf5eb]/95 p-1.5 shadow-[0_8px_24px_rgba(42,63,63,0.06)]">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setFeedTab("LATEST")}
                    className={`inline-flex items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-bold transition ${feedTab === "LATEST"
                      ? "bg-[#467750] text-white shadow-sm"
                      : "text-[#5f756d] hover:bg-[#deebe0]"
                      }`}
                  >
                    <Clock3 size={16} />
                    Latest
                  </button>

                  <button
                    onClick={() => setFeedTab("TOP")}
                    className={`inline-flex items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-bold transition ${feedTab === "TOP"
                      ? "bg-[#467750] text-white shadow-sm"
                      : "text-[#5f756d] hover:bg-[#deebe0]"
                      }`}
                  >
                    <TrendingUp size={16} />
                    Top posts
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-5 overflow-hidden rounded-[20px] border border-[#b7cfb2] bg-[#f4f8f4] shadow-[0_10px_30px_rgba(42,63,63,0.07),inset_0_1px_0_rgba(255,255,255,0.45)]">
              <div className="border-b border-[#c9d8cb] px-4 py-3 sm:px-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 shrink-0 border border-[#bfd0c3] bg-[#deebe0] shadow-sm">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback className="bg-[#deebe0] font-semibold text-[#45624c]">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <button
                    type="button"
                    onClick={() => setIsLocalCreateModalOpen(true)}
                    className="flex-1 rounded-[16px] border border-[#c9d8cb] bg-[#edf5eb] px-4 py-4 text-left transition hover:bg-[#e3eee3]"
                  >
                    <p className="text-[17px] font-bold text-[#24352f] sm:text-[18px]">
                      What did you lose or find?
                    </p>
                    <p className="mt-1 text-sm text-[#6b7f74]">
                      Share the details clearly so someone can help.
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLocalCreateModalOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9d8cb] bg-[#edf5eb] text-[#5f756d] transition hover:bg-[#deebe0] hover:text-[#2a3f3f]"
                  >
                    <ImageIcon size={18} />
                  </button>

                  <button
                    onClick={() => setIsLocalCreateModalOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9d8cb] bg-[#edf5eb] text-[#5f756d] transition hover:bg-[#deebe0] hover:text-[#2a3f3f]"
                  >
                    <MapPin size={18} />
                  </button>
                </div>

                <button
                  onClick={() => setIsLocalCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2a3f3f] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#223535]"
                >
                  <SquarePen size={16} />
                  Create post
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-5">
              {isLoading ? (
                <div className="rounded-[20px] border border-[#b7cfb2] bg-[#f4f8f4] px-6 py-16 text-center shadow-[0_10px_26px_rgba(42,63,63,0.05)]">
                  <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[#dcead8]" />
                  <p className="mt-4 text-lg font-bold text-[#30423b]">
                    Loading posts...
                  </p>
                  <p className="mt-1 text-sm text-[#6b7f74]">
                    Fetching the latest updates from the community.
                  </p>
                </div>
              ) : visiblePosts.length === 0 ? (
                <div className="rounded-[20px] border border-[#b7cfb2] bg-[#f4f8f4] px-6 py-16 text-center shadow-[0_10px_26px_rgba(42,63,63,0.05)]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9d8cb] bg-[#edf5eb] text-[#5f756d]">
                    <Search size={26} />
                  </div>
                  <p className="mt-5 text-xl font-bold text-[#30423b]">
                    No posts found
                  </p>
                  <p className="mt-2 text-sm text-[#6b7f74]">
                    Try adjusting your filters or create the first post in this view.
                  </p>
                  <button
                    onClick={() => setIsLocalCreateModalOpen(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2a3f3f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#223535]"
                  >
                    <SquarePen size={16} />
                    Create post
                  </button>
                </div>
              ) : (
                visiblePosts.map((post) => (
                  <div key={post.id} className="bg-transparent shadow-none">
                    <PostCard post={post} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </MainLayout>

      <PostFormModal
        open={isLocalCreateModalOpen}
        onOpenChange={setIsLocalCreateModalOpen}
      />
    </>
  );
}