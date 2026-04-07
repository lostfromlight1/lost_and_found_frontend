"use client";

import { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface CheckboxFormProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  control: Control<TFieldValues>;
  className?: string;
}

export default function CheckboxForm<TFieldValues extends FieldValues>({
  name,
  label,
  description = "",
  required = false,
  disabled = false,
  rules,
  control,
  className,
}: CheckboxFormProps<TFieldValues>) {
  const fieldDisplayName =
    label || (name ? name.charAt(0).toUpperCase() + name.slice(1) : "Field");
  const activeRules =
    rules ?? (required ? { required: `You must accept ${fieldDisplayName}` } : {});

  return (
    <FormField
      name={name}
      control={control}
      rules={activeRules}
      render={({ field }) => (
        <FormItem className={className}>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <FormControl>
              <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className="rounded-sm"
              />
            </FormControl>
            <div className="leading-none">
              {label ? (
                <span className="text-xs font-medium text-foreground">
                  {label}
                  {required && <span className="ml-1 text-destructive">*</span>}
                </span>
              ) : null}
              {description ? (
                <FormDescription className="text-[10px] leading-tight">
                  {description}
                </FormDescription>
              ) : null}
            </div>
          </label>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
