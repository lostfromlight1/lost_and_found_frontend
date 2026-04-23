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

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: ConfirmationDialogProps) {
  const handleConfirm = (): void => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl p-6 sm:p-8 border-slate-100 shadow-xl max-w-[420px] gap-6">
        <AlertDialogHeader className="items-start text-left">
          <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 mt-2 text-[15px] leading-relaxed font-medium">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:flex-row sm:justify-end gap-3 mt-2 sm:space-x-0">
          <AlertDialogCancel className="rounded-full px-5 py-2.5 h-auto text-[14px] font-bold border-slate-200 hover:bg-slate-50 text-slate-600 mt-0 shadow-none">
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            className="rounded-full px-6 py-2.5 h-auto text-[14px] font-bold bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] shadow-none"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
