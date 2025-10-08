// React
import {type ReactNode } from "react";

// External Libraries
import { Loader2 } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

// Custom Hooks
import { useTable } from "@/hooks/use-table";

// UI Components
import { AppTable } from "@/components/layout-ui/app-table";

// Types

// Utils
import { cn } from "@/lib/utils";

// Stores
import type { TListHandlerStore } from "@/stores";
import { useShallow } from "zustand/shallow";


interface ITableProps<TData, TExtra extends Record<string, unknown> = any> {
  MainClassName?: string;
  error?: string | null;
  columns: ColumnDef<TData>[];
  listStore: TListHandlerStore<TData, TExtra>;
  onRowClick?: (row: TData) => void;
  pageSizeOptions?: number[];
  rowClassName?: (row: TData, index: number) => string;
  colClassName?: string;
  showPagination?: boolean;
  footerContent?: ReactNode;
  emptyMessage?: string;
  className?: string;
  showHeader?: boolean;
}

export function Table<TData, TExtra extends Record<string, unknown> = any>({
  columns,
  MainClassName,
  listStore,
  pageSizeOptions,
  onRowClick,
  showPagination = true,
  footerContent,
  emptyMessage = "No results found.",
  className = "",
  rowClassName,
  colClassName = "",
  showHeader = true,
}: ITableProps<TData, TExtra>) {

  const {
    response: data,
    isLoading: loading,
    error,
    pagination,
    setPagination,
  } = listStore(useShallow((state) => ({
    response: state.response,
    isLoading: state.isLoading,
    error: state.error,
    pagination: state.pagination,
    setPagination: state.setPagination,
  }))
  );

  const onPageChange = (page: number) => {
    setPagination({ page });
  };
  const onLimitChange = (limit: number) => {
    setPagination({ limit });
  };


  const { table } = useTable<TData>({
    columns,
    data: data || [],
    defaultPageSize: pagination.limit || 10,
  });


  return (
    <div className={cn("px-4", MainClassName)}>
      {loading && (
        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      <AppTable
        onRowClick={onRowClick}
        emptyMessage={emptyMessage || "No results found."}
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        rowClassName={rowClassName}
        colClassName={colClassName}
        showPagination={showPagination}
        showHeader={showHeader}
        pageSizeOptions={pageSizeOptions}
        className={className}
        columns={columns}
        table={table}
        renderFooter={(table) => (
          <>
            {footerContent && footerContent}
            {error && (
              <p className="text-sm font-medium text-red-500 my-2">
                {error.message}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}
