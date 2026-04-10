"use client";

import {
  Control,
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface InputFormProps<TFieldValues extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: Path<TFieldValues>;
  label?: string;
  description?: string;
  type?: "text" | "email" | "password" | "number" | "decimal" | string;
  required?: boolean;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  control?: Control<TFieldValues>;
  register?: UseFormRegister<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
  inputClassName?: string;
}

export default function InputForm<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  type = "text",
  placeholder = "",
  required = false,
  readOnly = false,
  disabled = false,
  rules,
  control,
  register,
  errors,
  className,
  inputClassName,
  step,
  ...props
}: InputFormProps<TFieldValues>) {
  const activeRules = rules ?? buildDefaultRules(type, label, name, required, readOnly, disabled);
  const inputType = type === "decimal" ? "number" : type;
  const resolvedStep = type === "decimal" ? "any" : type === "number" ? "1" : step;

  // 1. Control Rendering Path (Preferred with Shadcn)
  if (control) {
    return (
      <FormField
        name={name}
        control={control}
        rules={activeRules}
        render={({ field }) => (
          <FormItem className={className}>
            {label ? (
              <FormLabel>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            ) : null}
            <FormControl>
              <Input
                type={inputType}
                step={resolvedStep}
                placeholder={placeholder}
                readOnly={readOnly}
                disabled={disabled}
                className={inputClassName}
                // CRITICAL FIX: Destructure field and enforce value fallback
                {...field}
                value={field.value ?? ""} 
                {...props}
              />
            </FormControl>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // 2. Register Rendering Path (Fallback)
  if (!register) {
    throw new Error("InputForm requires either `control` or `register`.");
  }

  const registeredField = register(name, activeRules);
  const errorMessage = errors?.[name]?.message as string | undefined;

  return (
    <div className={className ?? "space-y-2"}>
      {label ? (
        <label className="text-xs font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      ) : null}
      <Input
        type={inputType}
        step={resolvedStep}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={inputClassName}
        // CRITICAL FIX: Ensure the raw register field defaults appropriately 
        // though RHF handles this internally for standard registers, it's good practice.
        {...registeredField}
        {...props}
        aria-invalid={Boolean(errorMessage)}
      />
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function buildDefaultRules<TFieldValues extends FieldValues>(
  type: string,
  label: string | undefined,
  name: string,
  required: boolean,
  readOnly: boolean,
  disabled: boolean
): RegisterOptions<TFieldValues, Path<TFieldValues>> {
  if (readOnly || disabled) return {};

  const fieldDisplayName = label || (name ? name.charAt(0).toUpperCase() + name.slice(1) : "Field");
  const base = required ? { required: `${fieldDisplayName} is required` } : {};

  switch (type) {
    case "email":
      return {
        ...base,
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Please enter a valid email address",
        },
      };
    case "password":
      return {
        ...base,
        minLength: {
          value: 8,
          message: "Password must be at least 8 characters",
        },
      };
    default:
      return base;
  }
}
