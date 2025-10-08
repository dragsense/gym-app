// React & Hooks
import { useState } from "react";

// External libraries
import { Filter, XIcon } from "lucide-react";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom UI Components
import { DatePicker } from "@/components/shared-ui/date-picker";
import { type DateRange } from "react-day-picker";

interface IUserFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value?: any) => void;
  onClearFilters: () => void;
}

export function UserFilters({
  filters,
  onFilterChange,
  onClearFilters
}: IUserFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleDateSelect = (date: Date | DateRange | undefined) => {
    if (!date) {
      onFilterChange('joined');
      return;
    }

    if (date instanceof Date) {
      onFilterChange('joined', { createdAfter: date, createdBefore: undefined });
    } else if ("from" in date) {
      const { from: createdAfter, to: createdBefore } = date;

      if (createdAfter && createdBefore && createdAfter.getTime() !== createdBefore.getTime()) {
        onFilterChange('joined', { createdAfter, createdBefore });
      } else if (createdAfter) {
        onFilterChange('joined', { createdAfter, createdBefore: undefined });
      }
    }
  };

  const renderFilters = (
    <>
      <DatePicker
        placeholder="Joined"
        mode="range"
        value={filters.joined ? { 
          from: filters.joined.createdAfter, 
          to: filters.joined.createdBefore 
        } : undefined}
        onSelect={handleDateSelect}
      />
    </>
  );

  return (
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search trainers..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="flex-1"
        />
        
        {/* Mobile filters (dropdown) */}
        <div className="xl:hidden flex items-center gap-2">
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              collisionPadding={20}
              align="start"
              className="w-64 p-2"
            >
              <div className="flex flex-col gap-2">
                {renderFilters}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={onClearFilters} size="sm">
                    <XIcon className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Desktop filters (always visible) */}
        <div className="hidden xl:flex items-center gap-2">
          {renderFilters}
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} className="hidden lg:flex">
            <XIcon className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
  
  );
}