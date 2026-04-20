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
      render={({ field }) => {
        // Ensure value is ALWAYS a string, never undefined. 
        // "" keeps it strictly controlled on the first render, avoiding the React warning.
        // Since no option has value="", it will naturally show the placeholder.
        const safeValue = field.value !== undefined && field.value !== null 
            ? String(field.value) 
            : "";

        // FIXED: Manually find the matching option to bypass Radix UI's display bug with dynamic options
        const selectedOption = options.find((opt) => opt.value === safeValue);

        return (
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
              value={safeValue}
            >
              <FieldControl>
                <SelectTrigger className={triggerClassName ?? "w-full"}>
                  {/* Pass the label directly as children so it doesn't default to the raw ID */}
                  <SelectValue placeholder={placeholder}>
                    {selectedOption ? selectedOption.label : undefined}
                  </SelectValue>
                </SelectTrigger>
              </FieldControl>
              <SelectContent className="rounded-md">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            <FieldMessage />
          </FieldItem>
        );
      }}
    />
  )
}
