"use client"

import { Control, FieldValues, Path, RegisterOptions } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormDescription as FieldDescription,
  FormControl as FieldControl,
  FormField as Field,
  FormItem as FieldItem,
  FormLabel as FieldLabel,
  FormMessage as FieldMessage,
} from "@/components/ui/form"

export interface SelectOption {
  label: React.ReactNode;
  value: string;
}

export interface SelectFormProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  control: Control<TFieldValues>;
  className?: string;
  triggerClassName?: string;
}

export default function SelectForm<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  placeholder = "Select an option",
  options = [],
  required = false,
  disabled = false,
  rules,
  control,
  className,
  triggerClassName,
}: SelectFormProps<TFieldValues>) {
  const fieldDisplayName =
    label || (name ? name.charAt(0).toUpperCase() + name.slice(1) : "Field")
  const activeRules =
    rules ?? (required ? { required: `Please select ${fieldDisplayName}` } : {})

  return (
    <Field
      name={name}
      control={control}
      rules={activeRules}
      render={({ field }) => (
        <FieldItem className={className}>
          {label ? (
            <FieldLabel>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FieldLabel>
          ) : null}
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            value={field.value !== undefined && field.value !== null ? String(field.value) : undefined}
            defaultValue={field.value !== undefined && field.value !== null ? String(field.value) : undefined}
          >
            <FieldControl>
              <SelectTrigger className={triggerClassName ?? "w-full"}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FieldControl>
            <SelectContent className="rounded-md">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          <FieldMessage />
        </FieldItem>
      )}
    />
  )
}
