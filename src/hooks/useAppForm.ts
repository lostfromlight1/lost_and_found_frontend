import { useForm, UseFormProps, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";

export interface UseAppFormProps<TFieldValues extends FieldValues>
  extends Omit<UseFormProps<TFieldValues>, "resolver"> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: ZodType<TFieldValues, any, any>;
}

/**
 * A centralized wrapper around react-hook-form.
 * Provides consistent validation resolution via Zod and standardizes form options.
 */
export function useAppForm<TFieldValues extends FieldValues>({
  schema,
  mode = "onChange", // Validates on change for better UX
  defaultValues,
  ...rest
}: UseAppFormProps<TFieldValues> = {}) {
  const form = useForm<TFieldValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode,
    defaultValues,
    ...rest,
  });

  return form;
}
