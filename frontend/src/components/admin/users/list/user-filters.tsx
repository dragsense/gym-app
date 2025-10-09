// React & Hooks
import { useEffect, useState } from "react";

// External libraries
import { Filter, XIcon } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom UI Components
import { DatePicker } from "@/components/shared-ui/date-picker";
import { type DateRange } from "react-day-picker";
import { type IUser } from "@shared/interfaces/user.interface";
import { type TListHandlerStore } from "@/stores/list/list-handler-store";
import { useInput } from "@/hooks/use-input";
import { type TFieldConfigObject } from "@/@types/form/field-config.type";
import type { TUserListData } from "@shared/types";

interface IUserFiltersProps {
  store: TListHandlerStore<IUser, TUserListData, any>;
}

export function UserFilters({
  store,
}: IUserFiltersProps) {

  const filteredFields = store.getState().filteredFields;
  const filters = store(state => state.filters);
  const setFilters = store.getState().setFilters;

  const inputs = useInput<TUserListData>({
    fields: filteredFields as TFieldConfigObject<TUserListData>,
  });

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex-1 flex items-end gap-2 flex-wrap">
      {inputs.search}
      {inputs.createdAfter}
      {inputs.createdBefore}
      {inputs.dueDate}


      {hasActiveFilters && (
        <Button variant="outline" onClick={() => setFilters({})} className="hidden lg:flex">
          <XIcon className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>

  );
}