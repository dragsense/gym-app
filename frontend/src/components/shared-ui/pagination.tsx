
// React
import { useId, useMemo, useTransition } from "react";

// UI Components
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type{ IListPaginationState } from "@shared/interfaces/api/response.interface";

interface PaginationProps {
  datalength: number;
  pageSizeOptions?: number[];
  pagination: IListPaginationState
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({
  datalength,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  pagination,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  // React 19: Memoized page size options for better performance
  const memoizedPageSizeOptions = useMemo(() => pageSizeOptions, [pageSizeOptions]);

  // React 19: Smooth pagination changes
  const handlePageChange = (page: number) => {
    startTransition(() => {
      onPageChange(page);
    });
  };

  const handleLimitChange = (limit: number) => {
    startTransition(() => {
      onLimitChange(limit);
    });
  };

  return (
    <div className="flex items-center justify-between px-2" data-component-id={componentId}>
      <div className="flex-1 text-sm text-muted-foreground">
        {datalength} of {pagination.total}{" "}
        row(s) selected.
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pagination.limit}`}
            onValueChange={(value) => {
              handleLimitChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {memoizedPageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pagination.page} of {pagination.lastPage}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={!pagination.hasPrevPage}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(pagination.lastPage)}
            disabled={!pagination.hasNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
