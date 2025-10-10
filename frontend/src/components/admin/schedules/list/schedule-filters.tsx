// React & Hooks
import { XIcon } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";

// Custom UI Components
import { type ISchedule } from "@shared/interfaces/schedule.interface";
import { type TListHandlerStore } from "@/stores/list/list-handler-store";
import { useInput } from "@/hooks/use-input";
import { type TFieldConfigObject } from "@/@types/form/field-config.type";
import type { ScheduleListDto } from "@shared/dtos/schedule-dtos/schedule.dto";

interface IScheduleFiltersProps {
  store: TListHandlerStore<ISchedule, any, any>;
}

export function ScheduleFilters({ store }: IScheduleFiltersProps) {
  const filteredFields = store.getState().filteredFields;
  const filters = store((state) => state.filters);
  const setFilters = store.getState().setFilters;

  const inputs = useInput<ScheduleListDto>({
    fields: filteredFields as TFieldConfigObject<ScheduleListDto>,
  });

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex-1 flex items-end gap-2 flex-wrap">
      {inputs.search as React.ReactNode}
      {inputs.status as React.ReactNode}
      {inputs.frequency as React.ReactNode}
      {inputs.createdAfter as React.ReactNode}
      {inputs.createdBefore as React.ReactNode}

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={() => setFilters({})}
          className="hidden lg:flex"
        >
          <XIcon className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

