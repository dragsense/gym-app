// React & Hooks
import { useState, useId, useMemo, useTransition } from "react";

// External libraries
import { Plus } from "lucide-react";

// Types
import { type ISchedule } from "@shared/interfaces/schedule.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";
import { ViewToggle } from "@/components/shared-ui/view-toggle";

import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { scheduleItemViews as itemViews } from "./schedule-item-views";
import { ScheduleFilters } from "./schedule-filters";

// Stores
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";

export interface IScheduleListExtraProps { }

interface IScheduleListProps extends TListHandlerComponentProps<TListHandlerStore<ISchedule, any, IScheduleListExtraProps>,
  TSingleHandlerStore<ISchedule, any>> {
}

export type ViewType = "table" | "list";

export default function ScheduleList({
  storeKey,
  store,
  singleStore
}: IScheduleListProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return (`List store "${storeKey}" not found. Did you forget to register it?`);
  }

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }

  const setAction = singleStore(state => state.setAction);

  const [currentView, setCurrentView] = useState<ViewType>("table");

  // React 19: Smooth action transitions
  const handleCreate = () => {
    startTransition(() => {
      setAction('createOrUpdate');
    });
  };

  const handleEdit = (id: string) => {
    startTransition(() => {
      setAction('createOrUpdate', id);
    });
  }

  const handleDelete = (id: string) => {
    startTransition(() => {
      setAction('delete', id);
    });
  }

  const handleView = (id: string) => {
    startTransition(() => {
      setAction('view', id);
    });
  }

  const { columns, listItem } = itemViews({
    handleEdit,
    handleDelete,
    handleView
  });

  return (
    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} data-component-id={componentId}>
      <div className="flex flex-1 justify-between items-start md:items-center gap-2 flex-wrap">
        <ScheduleFilters store={store} />
        <ViewToggle componentId={componentId} />
        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            variant="default"
            data-component-id={componentId}
          >
            <Plus /> <span className="hidden sm:inline">Create Schedule</span>
          </Button>

        </div>
      </div>

      <TabsContent value="table">
        <AppCard className="px-0">
          <TTable<ISchedule>
            listStore={store}
            columns={columns}
            emptyMessage="No schedules found."
            showPagination={true}
          /></AppCard>
      </TabsContent>

      <TabsContent value="list">
        <div>
          <TList<ISchedule>
            listStore={store}
            emptyMessage="No schedules found."
            showPagination={true}
            renderItem={listItem}
          />
        </div>
      </TabsContent>

    </Tabs>
  );
}

