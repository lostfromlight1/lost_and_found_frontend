"use client"

import {
  Control,
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

export interface TextareaFormProps<TFieldValues extends FieldValues>
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>
  control?: Control<TFieldValues>
  register?: UseFormRegister<TFieldValues>
  errors?: FieldErrors<TFieldValues>
  textareaClassName?: string
}

export default function TextareaForm<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  placeholder = "",
  required = false,
  readOnly = false,
  disabled = false,
  rules,
  control,
  register,
  errors,
  className,
  textareaClassName,
  ...props
}: TextareaFormProps<TFieldValues>) {
  const fieldDisplayName =
    label || (name ? name.charAt(0).toUpperCase() + name.slice(1) : "Field")
  const activeRules =
    rules ?? (required ? { required: `${fieldDisplayName} is required` } : {})

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
              <Textarea
                placeholder={placeholder}
                readOnly={readOnly}
                disabled={disabled}
                className={textareaClassName}
                {...field}
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
    )
  }

  if (!register) {
    throw new Error("TextareaForm requires either `control` or `register`.")
  }

  const errorMessage = errors?.[name]?.message as string | undefined

  return (
    <div className={className ?? "space-y-2"}>
      {label ? (
        <label className="text-xs font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      ) : null}
      <Textarea
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={textareaClassName}
        {...register(name, activeRules)}
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
  )
}
