"use client"

import * as React from "react"
import { Control, FieldValues, Path, RegisterOptions } from "react-hook-form"
import { type DateRange } from "react-day-picker"
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

export type DateRangePickerFormProps<TFieldValues extends FieldValues> = {
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
  "mode" | "selected" | "onSelect" | "disabled" | "numberOfMonths" | "defaultMonth"
>

export default function DateRangePickerForm<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  placeholder = "Pick a date range",
  required = false,
  disabled = false,
  rules,
  control,
  className,
  buttonClassName,
  ...props
}: DateRangePickerFormProps<TFieldValues>) {
  const fieldDisplayName =
    label || (name ? name.charAt(0).toUpperCase() + name.slice(1) : "Field")
  const activeRules =
    rules ?? (required ? { required: `${fieldDisplayName} is required` } : {})

  return (
    <FormField
      control={control}
      name={name}
      rules={activeRules}
      render={({ field }) => {
        const typedValue = field.value as DateRange | undefined

        return (
          <FormItem className={cn("flex flex-col", className)}>
            {label ? (
              <FormLabel>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            ) : null}
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "h-11 w-full justify-start rounded-md px-3 text-left font-normal",
                      !typedValue && "text-muted-foreground",
                      buttonClassName
                    )}
                    disabled={disabled}
                  >
                    <CalendarBlankIcon className="mr-2 h-4 w-4 opacity-50" />
                    {typedValue?.from ? (
                      typedValue.to ? (
                        <>
                          {formatDate(typedValue.from)} -{" "}
                          {formatDate(typedValue.to)}
                        </>
                      ) : (
                        formatDate(typedValue.from)
                      )
                    ) : (
                      <span>{placeholder}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                
                {/* Ensure the Popover correctly aligns inside narrow containers */}
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={typedValue?.from}
                    selected={typedValue}
                    onSelect={field.onChange}
                    numberOfMonths={1} // FIX: Changed from 2 to 1 so it perfectly fits the sidebar
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
        )
      }}
    />
  )
}
