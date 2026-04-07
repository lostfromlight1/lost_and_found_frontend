"use client"

import { Control, FieldValues, Path, RegisterOptions } from "react-hook-form"
import {
  FormDescription as FieldDescription,
  FormField as Field,
  FormItem as FieldItem,
  FormLabel as FieldLabel,
  FormMessage as FieldMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export interface RadioOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface RadioFormProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  description?: string;
  options?: RadioOption[];
  required?: boolean;
  disabled?: boolean;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  control: Control<TFieldValues>;
  className?: string;
  optionClassName?: string;
  groupClassName?: string;
}

export default function RadioForm<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  options = [],
  required = false,
  disabled = false,
  rules,
  control,
  className,
  optionClassName,
  groupClassName,
}: RadioFormProps<TFieldValues>) {
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
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
            className={groupClassName}
          >
            {options.map((option) => (
              <label
                key={option.value}
                className={
                  optionClassName ?? "flex items-center gap-2 cursor-pointer"
                }
              >
                <RadioGroupItem
                  value={option.value}
                  disabled={disabled || option.disabled}
                />
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          <FieldMessage />
        </FieldItem>
      )}
    />
  )
}
