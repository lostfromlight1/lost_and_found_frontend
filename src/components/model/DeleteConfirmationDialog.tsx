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
  const resolvedTitle =
    title ?? `Delete ${entityLabel}`;

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
      <AlertDialogContent className="rounded-md">
        <AlertDialogHeader className="items-start text-left">
          <AlertDialogTitle>
            {resolvedTitle}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {resolvedDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:flex-row sm:justify-end">
          <AlertDialogCancel className="rounded-md">
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            className="rounded-md px-3 py-3"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
