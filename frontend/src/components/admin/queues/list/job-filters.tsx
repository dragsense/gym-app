// React & Hooks
import { XIcon } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";

// Custom UI Components
import { type IQueueJob } from "@shared/interfaces/queue.interface";
import { type TListHandlerStore } from "@/stores/list/list-handler-store";
import { useInput } from "@/hooks/use-input";
import { type TFieldConfigObject } from "@/@types/form/field-config.type";
import { JobListDto } from "@shared/dtos/queue-dtos/queue.dto";

interface IJobFiltersProps {
  store: TListHandlerStore<IQueueJob, any, any>;
}

export function JobFilters({ store }: IJobFiltersProps) {
  const filteredFields = store.getState().filteredFields;
  const filters = store((state) => state.filters);
  const setFilters = store.getState().setFilters;

  const inputs = useInput<JobListDto>({
    fields: filteredFields as TFieldConfigObject<JobListDto>,
  });

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex-1 flex items-end gap-2 flex-wrap">
      {inputs.search}
      {inputs.status}
      {inputs.createdAfter}
      {inputs.createdBefore}

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
