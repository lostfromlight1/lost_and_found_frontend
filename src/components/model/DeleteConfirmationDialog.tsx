"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  entityLabel?: string;
  itemName?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  entityLabel = "record",
  itemName,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: DeleteConfirmationDialogProps) {
  const resolvedTitle = title ?? `Delete ${entityLabel}?`;

  const resolvedDescription =
    description ??
    `This action cannot be undone. ${
      itemName
        ? `This will permanently delete "${itemName}".`
        : `This will permanently delete this ${entityLabel.toLowerCase()}.`
    }`;

  const handleConfirm = (): void => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl p-6 sm:p-8 border-slate-100 shadow-xl max-w-[420px] gap-6">
        <AlertDialogHeader className="items-start text-left">
          <AlertDialogTitle className="text-xl font-black text-red-600 tracking-tight">
            {resolvedTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 mt-2 text-[15px] leading-relaxed font-medium">
            {resolvedDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:flex-row sm:justify-end gap-3 mt-2 sm:space-x-0">
          <AlertDialogCancel className="rounded-full px-5 py-2.5 h-auto text-[14px] font-bold border-slate-200 hover:bg-slate-50 text-slate-600 mt-0 shadow-none">
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            className="rounded-full px-6 py-2.5 h-auto text-[14px] font-bold bg-red-600 text-white hover:bg-red-700 shadow-none border-none"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
