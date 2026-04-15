"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { X, Upload, ImageIcon } from "lucide-react"; 
import Image from "next/image"; // Import Next.js Image component
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/model/FormModal";
import InputForm from "@/components/form/InputForm";
import SelectForm from "@/components/form/SelectForm";
import TextareaForm from "@/components/form/TextareaForm";
import DatePickerForm from "@/components/form/DatePickerForm";
import { api } from "@/lib/api/axios";
import { useCreatePost, useUpdatePost } from "@/features/post/hooks/usePosts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { PostResponseDto } from "@/features/post/api/response/posts.response";

// Define the interface for the image upload response
interface ImageUploadResponse {
  url: string;
  publicId: string;
}

const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  type: z.enum(["LOST", "FOUND"]),
  status: z.enum(["OPEN", "CLOSE"]),
  categoryId: z.coerce.number().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  lostFoundDate: z.date(),
  contactInfo: z.string().trim().min(1, "Contact info is required"),
  reward: z.coerce.number().optional().default(0),
  images: z.array(
    z.object({
      url: z.string(),
      publicId: z.string(),
      sortOrder: z.number().default(0),
    })
  ).default([]),
});

type PostFormInput = z.input<typeof postSchema>;
type PostFormOutput = z.output<typeof postSchema>;

interface PostFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postToEdit?: PostResponseDto | null;
}

interface CategoryItem {
  id: number;
  name: string;
}

const MYANMAR_CITIES = [
  { label: "Yangon", value: "YANGON" },
  { label: "Mandalay", value: "MANDALAY" },
  { label: "Naypyidaw", value: "NAYPYIDAW" },
  { label: "Taunggyi", value: "TAUNGGYI" },
  { label: "Mawlamyine", value: "MAWLAMYINE" },
];

export default function PostFormModal({ open, onOpenChange, postToEdit }: PostFormModalProps) {
  const isUpdate = !!postToEdit;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: createPost, isPending: isCreating } = useCreatePost();
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  
  const isSubmitting = isCreating || isUpdating;

  // Replaced 'any' with a structured unknown cast
  const safeCategoriesData = categoriesData as unknown as { 
    content?: CategoryItem[]; 
    data?: CategoryItem[] 
  } | undefined;

  const categoriesList: CategoryItem[] = Array.isArray(categoriesData) 
    ? categoriesData 
    : safeCategoriesData?.content || safeCategoriesData?.data || [];
    
  const categoryOptions = categoriesList.map((cat) => ({
    label: cat.name,
    value: String(cat.id),
  }));

  const form = useForm<PostFormInput, unknown, PostFormOutput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "LOST",
      status: "OPEN",
      categoryId: 0,
      location: "",
      lostFoundDate: new Date(),
      contactInfo: "",
      reward: 0,
      images: [],
    },
  });

  const currentImages = form.watch("images") || [];

  useEffect(() => {
    if (open && postToEdit) {
      form.reset({
        title: postToEdit.title,
        description: postToEdit.description,
        type: postToEdit.type,
        status: postToEdit.status,
        categoryId: postToEdit.category.id,
        location: postToEdit.location,
        lostFoundDate: new Date(postToEdit.lostFoundDate),
        contactInfo: postToEdit.contactInfo,
        reward: postToEdit.reward,
        images: postToEdit.images.map(img => ({
          url: img.url,
          // Replaced 'any' with explicit type checking or optional chaining
          publicId: (img as { publicId?: string }).publicId || String(img.id), 
          sortOrder: img.sortOrder,
        })),
      });
    } else if (open && !postToEdit) {
      form.reset({
        title: "",
        description: "",
        type: "LOST",
        status: "OPEN",
        categoryId: 0,
        location: "",
        lostFoundDate: new Date(),
        contactInfo: "",
        reward: 0,
        images: [],
      });
    }
  }, [open, postToEdit, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Explicitly typed the API call to resolve "Property does not exist" errors
      const uploadedData = await api.post<never, ImageUploadResponse>("/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadedData?.url || !uploadedData?.publicId) {
        throw new Error("Invalid response wrapper");
      }

      const newImage = {
        url: uploadedData.url, 
        publicId: uploadedData.publicId,
        sortOrder: currentImages.length,
      };

      form.setValue("images", [...currentImages, newImage], { shouldValidate: true, shouldDirty: true });
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = currentImages
      .filter((_, idx) => idx !== indexToRemove)
      .map((img, idx) => ({ ...img, sortOrder: idx })); 
    
    form.setValue("images", updatedImages, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (data: PostFormOutput) => {
    const formattedData = {
      ...data,
      lostFoundDate: data.lostFoundDate.toISOString().split("T")[0],
    };

    if (isUpdate && postToEdit) {
      updatePost(
        { id: postToEdit.id, data: formattedData },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createPost(formattedData, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      mode={isUpdate ? "update" : "create"}
      entityLabel="Post"
      size="lg"
      formId="post-form"
      isSubmitting={isSubmitting}
    >
      <Form {...form}>
        <form id="post-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputForm control={form.control} name="title" label="Title" required />
            <InputForm control={form.control} name="contactInfo" label="Contact Info" required />
            
            <SelectForm
              control={form.control}
              name="type"
              label="Post Type"
              options={[
                { label: "Lost", value: "LOST" },
                { label: "Found", value: "FOUND" },
              ]}
              required
            />
            
            <SelectForm
              control={form.control}
              name="location"
              label="Location (City)"
              options={MYANMAR_CITIES}
              required
            />

            <SelectForm
              control={form.control}
              name="categoryId"
              label="Category"
              options={categoryOptions}
              disabled={isLoadingCategories}
              placeholder={isLoadingCategories ? "Loading categories..." : "Select category"}
              required
            />

            <DatePickerForm 
              control={form.control} 
              name="lostFoundDate" 
              label="Date" 
              required 
            />

            <InputForm control={form.control} name="reward" label="Reward Amount (Optional)" type="number" />
            
            {isUpdate && (
              <SelectForm
                control={form.control}
                name="status"
                label="Status"
                options={[
                  { label: "Open", value: "OPEN" },
                  { label: "Close", value: "CLOSE" },
                ]}
              />
            )}
          </div>
          
          <TextareaForm control={form.control} name="description" label="Description" rows={4} required />

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Post Images</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? <Upload className="animate-bounce" size={16} /> : <ImageIcon size={16} />}
                {isUploading ? "Uploading..." : "Add Image"}
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
              />
            </div>

            {currentImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {currentImages.map((img, index) => (
                  <div key={img.publicId} className="relative group aspect-square rounded-md overflow-hidden border bg-slate-50 flex items-center justify-center">
                    {/* Fixed: Replaced <img> with Next.js <Image /> component */}
                    <Image 
                      src={img.url} 
                      alt={`Upload ${index}`} 
                      fill 
                      className="object-cover" 
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                    
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-slate-50/50 text-slate-500">
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">No images uploaded</p>
                <p className="text-xs">Click Add Image to upload photos</p>
              </div>
            )}
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
