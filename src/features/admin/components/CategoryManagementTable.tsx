"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppTable, { TableColumn } from "@/components/AppTable";
import FormModal from "@/components/model/FormModal";
import DeleteConfirmationDialog from "@/components/model/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import InputForm from "@/components/form/InputForm";
import { Pencil, Trash2 } from "lucide-react"; // <-- ADDED ICONS
import { CategoryResponse } from "@/features/categories/api/response/categories.response";
import {
  useCategories,
  useCreateCategory,
  useEditCategory,
  useDeleteCategory,
} from "@/features/categories/hooks/useCategories";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Maximum 100 characters allowed"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryManagementTable() {
  const [search, setSearch] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryResponse | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryResponse | null>(null);

  const { data: categories, isLoading } = useCategories();
  const { mutate: createCat, isPending: isCreating } = useCreateCategory();
  const { mutate: editCat, isPending: isEditing } = useEditCategory();
  const { mutate: deleteCat, isPending: isDeleting } = useDeleteCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (isFormOpen) {
      form.reset({ name: categoryToEdit ? categoryToEdit.name : "" });
    } else {
      setTimeout(() => form.reset({ name: "" }), 200); 
    }
  }, [isFormOpen, categoryToEdit, form]);

  const onSubmit = (values: CategoryFormValues) => {
    if (categoryToEdit) {
      editCat(
        { id: categoryToEdit.id, data: values },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createCat(values, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCat(categoryToDelete.id, {
        onSuccess: () => setCategoryToDelete(null),
      });
    }
  };

  const filteredCategories = (categories || []).filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: TableColumn<CategoryResponse>[] = [
    { key: "id", header: "ID", width: 80 },
    { key: "name", header: "Category Name", className: "w-full font-medium" },
    {
      key: "actions",
      header: "Actions",
      width: 120,
      className: "text-center", // <-- CENTERED HEADER
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end"> {/* <-- RIGHT ALIGNED ICONS */}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => {
              setCategoryToEdit(row);
              setIsFormOpen(true);
            }}
            title="Edit Category"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            disabled={isDeleting && categoryToDelete?.id === row.id}
            onClick={() => setCategoryToDelete(row)}
            title="Delete Category"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AppTable
        columns={columns}
        data={filteredCategories}
        loading={isLoading}
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search categories..."
        addLabel="Add Category"
        onAdd={() => {
          setCategoryToEdit(null);
          setIsFormOpen(true);
        }}
      />

      <FormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setCategoryToEdit(null);
        }}
        mode={categoryToEdit ? "update" : "create"}
        entityLabel="Category"
        formId="category-form"
        isSubmitting={isCreating || isEditing}
      >
        <Form {...form}>
          <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <InputForm
              control={form.control}
              name="name"
              label="Category Name"
              placeholder="e.g. Electronics, Clothing..."
              required
            />
          </form>
        </Form>
      </FormModal>

      <DeleteConfirmationDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={categoryToDelete?.name}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Category"
      />
    </div>
  );
}
