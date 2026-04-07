"use client"

import * as React from "react"
import { Control, FieldValues, Path, RegisterOptions } from "react-hook-form"
import { formatDate } from "@/lib/date-time"
import { CalendarBlankIcon } from "@phosphor-icons/react"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export type DatePickerFormProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>
  control: Control<TFieldValues>
  className?: string
  buttonClassName?: string
} & Omit<
  React.ComponentProps<typeof Calendar>,
  "mode" | "selected" | "onSelect" | "disabled"
>

export default function DatePickerForm<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  placeholder = "Pick a date",
  required = false,
  disabled = false,
  rules,
  control,
  className,
  buttonClassName,
  ...props
}: DatePickerFormProps<TFieldValues>) {
  const fieldDisplayName =
    label || (name ? name.charAt(0).toUpperCase() + name.slice(1) : "Field")
  const activeRules =
    rules ?? (required ? { required: `${fieldDisplayName} is required` } : {})

  return (
    <FormField
      control={control}
      name={name}
      rules={activeRules}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          {label ? (
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          ) : null}
          <FormControl>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-9 w-full justify-between rounded-md px-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                      buttonClassName
                    )}
                    disabled={disabled}
                  >
                    {field.value ? (
                      formatDate(field.value as Date)
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    <CalendarBlankIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value as Date}
                  onSelect={field.onChange}
                  disabled={disabled}
                  {...props}
                />
              </PopoverContent>
            </Popover>
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
