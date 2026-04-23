"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import FormModal from "@/components/model/FormModal";
import SelectForm from "@/components/form/SelectForm";
import TextareaForm from "@/components/form/TextareaForm";
import { useCreateReport } from "@/features/reports/hooks/useReports";
import { ReportTargetType } from "@/features/reports/api/request/reports.request";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId: number;
}

interface ReportFormData {
  reason: string;
  description: string;
}

const REASONS = [
  "SPAM", "SCAM", "INAPPROPRIATE", "HARASSMENT", "FAKE", "OTHER"
];

const REASON_OPTIONS = REASONS.map((r) => ({
  label: r.charAt(0) + r.slice(1).toLowerCase().replace("_", " "),
  value: r,
}));

export default function ReportModal({ open, onOpenChange, targetType, targetId }: ReportModalProps) {
  const { mutate: submitReport, isPending } = useCreateReport();
  
  // Generate a strictly unique ID for this specific modal instance
  const uniqueFormId = `report-form-${useId().replace(/:/g, "")}-${targetId}`;

  const form = useForm<ReportFormData>({
    defaultValues: {
      reason: "",
      description: "",
    },
  });

  const onSubmit = (data: ReportFormData) => {
    submitReport(
      { 
        targetType, 
        targetId, 
        reason: data.reason, 
        description: data.description 
      },
      { 
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        } 
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      form.reset(); // Clear the form when the modal is closed
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={handleOpenChange}
      title={`Report ${targetType.charAt(0) + targetType.slice(1).toLowerCase()}`}
      description="Please let us know why you are reporting this content."
      formId={uniqueFormId}
      submitLabel="Submit Report"
      isSubmitting={isPending}
      size="sm"
    >
      <Form {...form}>
        <form 
          id={uniqueFormId} 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-5 py-2 px-1"
        >
          <SelectForm
            control={form.control}
            name="reason"
            label="Reason"
            placeholder="Select a reason"
            options={REASON_OPTIONS}
            required
            disabled={isPending}
          />

          <TextareaForm
            control={form.control}
            name="description"
            label="Additional Details"
            placeholder="Provide any extra information (optional)..."
            rows={4}
            disabled={isPending}
          />
        </form>
      </Form>
    </FormModal>
  );
}
