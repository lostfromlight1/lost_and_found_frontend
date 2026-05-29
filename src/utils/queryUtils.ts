// ─── Types ───────────────────────────────────────────────────────────────────

export type SearchParamValue = string | string[] | undefined | null;
export type SearchParams = Record<string, SearchParamValue>;

// ─── Param String Builder (multi-value safe) ─────────────────────────────────

export const getParamString = (
  keys: string[],
  params: SearchParams
): string => {
  const backendParams = new URLSearchParams();

  keys.forEach((key) => {
    const value = params[key];

    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item.trim() !== "") {
          backendParams.append(key, item);
        }
      });
    } else if (typeof value === "string" && value.trim() !== "") {
      backendParams.append(key, value);
    }
  });

  return backendParams.toString();
};

// ─── Generic Query String Builder ────────────────────────────────────────────

export function generateQueryString<T extends Record<string, unknown>>(
  params: T
): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        return `${key}=${value.join(",")}`;
      }
      return `${key}=${encodeURIComponent(String(value))}`;
    })
    .join("&");

  return query ? query : "";
}

// ─── File Type Label ──────────────────────────────────────────────────────────

const FILE_TYPE_MAP: Record<string, string> = {
  "application/pdf": "PDF Document",
  "application/msword": "Word Document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
  "application/vnd.ms-excel": "Excel Spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel Spreadsheet",
  "text/plain": "Text File",
  "application/zip": "ZIP Archive",
  "application/x-rar-compressed": "RAR Archive",
  "application/json": "JSON File",
};

export function readableFileType(file: File): string {
  if (file.type.startsWith("image/")) return "Image";
  return FILE_TYPE_MAP[file.type] ?? "File";
}
