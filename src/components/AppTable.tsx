"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/* =========================================================
   TYPES
========================================================= */

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  width?: string | number;
  className?: string;
  cellClassName?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface AppTableSearchProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  initialValue?: string;
  className?: string;
}

interface AppTableExportProps {
  onExport?: () => void;
  label?: string;
  className?: string;
}

interface AppTableCreateProps {
  onAdd?: () => void;
  label?: string;
  className?: string;
}

interface AppTableProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
  addLabel?: string;
  onAdd?: () => void;
  canExport?: boolean;
  onExport?: () => void;
  className?: string;
  headerClassName?: string;
  tableContainerClassName?: string;
  // NEW PROP ADDED:
  customFilters?: React.ReactNode; 
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */

export function AppTableSearch({
  placeholder = "Search...",
  onSearch,
  initialValue = "",
  className,
}: AppTableSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== initialValue) {
        onSearch?.(searchTerm);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, onSearch, initialValue]);

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <MagnifyingGlassIcon
        size={16}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

export function AppTableExport({
  onExport,
  label = "Export",
  className,
}: AppTableExportProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      className={cn("flex items-center gap-2 py-5 rounded-md", className)}
    >
      <ArrowSquareOutIcon size={16} />
      <span>{label}</span>
    </Button>
  );
}

export function AppTableCreate({
  onAdd,
  label = "Add New",
  className,
}: AppTableCreateProps) {
  return (
    <Button
      size="sm"
      onClick={onAdd}
      className={cn("flex items-center gap-2 py-5 rounded-md", className)}
    >
      <PlusIcon size={16} />
      <span>{label}</span>
    </Button>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AppTable<T extends object>({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue = "",
  addLabel,
  onAdd,
  canExport = false,
  onExport,
  className,
  headerClassName,
  tableContainerClassName,
  customFilters, // DESTRUCTURED HERE
}: AppTableProps<T>) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Header / Actions */}
      <div className={cn("flex flex-wrap items-center justify-between gap-4", headerClassName)}>
        <div className="flex flex-1 items-center gap-2 min-w-50">
          <AppTableSearch
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            initialValue={searchValue}
          />
        </div>

        {/* INJECTED CUSTOM FILTERS NEXT TO BUTTONS */}
        <div className="flex items-center gap-4">
          {customFilters}
          {canExport && <AppTableExport onExport={onExport} />}
          {addLabel && <AppTableCreate onAdd={onAdd} label={addLabel} />}
        </div>
      </div>

      {/* Table Content */}
      <div className={cn("rounded-md border border-border bg-card shadow-sm", tableContainerClassName)}>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              {columns.map((column, index) => (
                <TableHead
                  key={column.key || index}
                  className={cn("text-foreground font-semibold", column.className)}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-card">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow key={(row as { id?: string | number }).id ?? rowIndex}>
                  {columns.map((column, colIndex) => {
                    const value = (row as Record<string, unknown>)[column.key];
                    return (
                      <TableCell
                        key={`${rowIndex}-${column.key || colIndex}`}
                        className={cn(column.className, column.cellClassName)}
                      >
                        {column.render
                          ? column.render(value, row)
                          : String(value ?? "")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
