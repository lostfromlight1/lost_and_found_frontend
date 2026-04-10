"use client";

import React from "react";
import { X } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ... keep all your types exactly the same ...
type FormModalMode = "create" | "update";
type FormModalSize = "sm" | "md" | "lg" | "xl" | "full";

type FormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: FormModalMode;
  entityLabel?: string;
  size?: FormModalSize;
  contentClassName?: string;
  title?: string;
  description?: string;
  formId?: string;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
};

export default function FormModal({
  open,
  onOpenChange,
  mode = "create",
  entityLabel = "Record",
  size = "md",
  contentClassName = "",
  title,
  description,
  formId,
  submitLabel,
  cancelLabel = "Cancel",
  isSubmitting = false,
  children,
}: FormModalProps) {
  const isCreate = mode === "create";

  const resolvedTitle =
    title ?? `${isCreate ? "Create" : "Update"} ${entityLabel}`;

  const resolvedDescription =
    description ??
    `${isCreate ? "Fill in the form to add a new" : "Update the details for this"} ${entityLabel.toLowerCase()}.`;

  const resolvedSubmitLabel =
    submitLabel ?? (isCreate ? "Create" : "Update");

  const sizeClassMap: Record<FormModalSize, string> = {
    sm: "data-[size=default]:max-w-md data-[size=default]:sm:max-w-md",
    md: "data-[size=default]:max-w-2xl data-[size=default]:sm:max-w-2xl",
    lg: "data-[size=default]:max-w-3xl data-[size=default]:sm:max-w-3xl",
    xl: "data-[size=default]:max-w-5xl data-[size=default]:sm:max-w-5xl",
    full: "data-[size=default]:max-w-[95vw] data-[size=default]:sm:max-w-[95vw]",
  };

  const resolvedSizeClass =
    sizeClassMap[size] ?? sizeClassMap.md;

  const handleClose = (): void => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={`${resolvedSizeClass} flex max-h-[90vh] flex-col rounded-md p-0 ${contentClassName}`.trim()}
      >
        <div className="relative border-b p-4">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 rounded-md"
            onClick={handleClose}
          >
            <X size={14} />
            <span className="sr-only">Close</span>
          </Button>

          <AlertDialogHeader className="items-start text-left">
            <AlertDialogTitle>
              {resolvedTitle}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {resolvedDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="min-h-0 overflow-y-auto p-4">
          {children}
        </div>

        <AlertDialogFooter className="border-t p-4 sm:flex-row sm:justify-end">
          <AlertDialogCancel className="rounded-md">
            {cancelLabel}
          </AlertDialogCancel>

          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting}
            className="rounded-md"
          >
            {resolvedSubmitLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
