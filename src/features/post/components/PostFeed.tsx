"use client";

import { useState } from "react";
import { Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePosts } from "../hooks/usePosts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import PostCard from "./PostCard";
import PostFormModal from "./PostFormModal";

const MYANMAR_CITIES = [
  { label: "Yangon", value: "YANGON" }, { label: "Mandalay", value: "MANDALAY" },
  { label: "Naypyidaw", value: "NAYPYIDAW" }, { label: "Taunggyi", value: "TAUNGGYI" },
  { label: "Mawlamyine", value: "MAWLAMYINE" }, { label: "Bago", value: "BAGO" },
  { label: "Pathein", value: "PATHEIN" }, { label: "Myitkyina", value: "MYITKYINA" },
  { label: "Monywa", value: "MONYWA" }, { label: "Sittwe", value: "SITTWE" },
  { label: "Pyay", value: "PYAY" }, { label: "Pakokku", value: "PAKOKKU" },
  { label: "Magway", value: "MAGWAY" }, { label: "Hpa-An", value: "HPA_AN" },
  { label: "Lashio", value: "LASHIO" }, { label: "Dawei", value: "DAWEI" },
  { label: "Meiktila", value: "MEIKTILA" }, { label: "Pyin Oo Lwin", value: "PYIN_OO_LWIN" },
  { label: "Loikaw", value: "LOIKAW" }, { label: "Hakha", value: "HAKHA" },
  { label: "Myeik", value: "MYEIK" },
];

interface CategoryItem { id: number; name: string; }

export default function PostFeed() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Filter States
  const [type, setType] = useState<"LOST" | "FOUND" | "ALL">("ALL");
  const [city, setCity] = useState<string>("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [locationDetails, setLocationDetails] = useState("");

  const { data: categoriesData } = useCategories();
  const safeCategoriesData = categoriesData as unknown as { content?: CategoryItem[]; data?: CategoryItem[] };
  const categoriesList: CategoryItem[] = Array.isArray(categoriesData) 
    ? categoriesData : safeCategoriesData?.content || safeCategoriesData?.data || [];

  const activeFilters = {
    page: 0, size: 20,
    ...(type !== "ALL" && { type: type as "LOST" | "FOUND" }),
    ...(city !== "ALL" && { city }),
    ...(categoryId !== "ALL" && { categoryId: Number(categoryId) }),
    ...(locationDetails.trim() && { locationDetails: locationDetails.trim() }),
  };

  const { data: postsPage, isLoading } = usePosts(activeFilters);
  const posts = postsPage?.content || [];

  return (
    <div className="w-full space-y-6">
      
      {/* Top Input Row (From Wireframe) */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 justify-start rounded-full text-slate-500 bg-white border-slate-300 h-12 text-md shadow-sm hover:bg-slate-50 cursor-text"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <div className="w-8 h-8 rounded-full bg-slate-200 mr-2 flex shrink-0 items-center justify-center text-xs text-slate-500 font-bold">Me</div>
          Write something...
        </Button>
        <Button 
          className="rounded-full h-12 px-6 font-semibold shadow-sm shrink-0" 
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircle className="mr-2" size={20} />
          New Post
        </Button>
      </div>

      {/* Filter Row (From Wireframe) */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={type} onValueChange={(val) => setType((val as "LOST" | "FOUND" | "ALL") || "ALL")}>
          <SelectTrigger className="bg-white rounded-full h-10 shadow-sm border-slate-200"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
            <SelectItem value="FOUND">Found</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={(val) => setCategoryId(val || "ALL")}>
          <SelectTrigger className="bg-white rounded-full h-10 shadow-sm border-slate-200"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categoriesList.map((cat) => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={city} onValueChange={(val) => setCity(val || "ALL")}>
          <SelectTrigger className="bg-white rounded-full h-10 shadow-sm border-slate-200"><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Cities</SelectItem>
            {MYANMAR_CITIES.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search location details..." 
            className="pr-10 bg-white rounded-full h-10 shadow-sm border-slate-200"
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
          />
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Search size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700">No posts found</p>
          </div>
        ) : (
          posts.map((post) => (<PostCard key={post.id} post={post} />))
        )}
      </div>

      <PostFormModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}
