import dayjs from "dayjs";

const DEFAULT_FALLBACK = "-";

export type DateValue = string | number | Date | dayjs.Dayjs | null | undefined;

function toDayjs(value: DateValue): dayjs.Dayjs | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

export function formatDate(
  value: DateValue,
  format = "MMM DD, YYYY",
  fallback = DEFAULT_FALLBACK
): string {
  const parsed = toDayjs(value);
  return parsed ? parsed.format(format) : fallback;
}

export function formatTime(
  value: DateValue,
  format = "HH:mm",
  fallback = DEFAULT_FALLBACK
): string {
  const parsed = toDayjs(value);
  return parsed ? parsed.format(format) : fallback;
}

export function formatDateTime(
  value: DateValue,
  format = "MMM DD, YYYY HH:mm",
  fallback = DEFAULT_FALLBACK
): string {
  const parsed = toDayjs(value);
  return parsed ? parsed.format(format) : fallback;
}
