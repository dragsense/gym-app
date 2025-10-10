// Types
import { type IActivityLog } from "@shared/interfaces/activity-log.interface";


// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";

import { ActivityLogFilters } from "./activity-log-filters";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { itemViews } from "./activity-log-item-views";

// Stores
import { type TListHandlerStore } from "@/stores";


// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TActivityLogListData } from "@shared/types";





interface IActivityLogListProps extends TListHandlerComponentProps<TListHandlerStore<IActivityLog, TActivityLogListData, any>> {
}

export type ViewType = "table" | "list";


export default function ActivityLogList({
  storeKey,
  store
}: IActivityLogListProps) {

  if (!store) {
    return (`List store "${storeKey}" not found. Did you forget to register it?`);
  }


  const { columns } = itemViews();


  return (

    <div className="space-y-2">
      <ActivityLogFilters
        store={store}
      />


      <AppCard className="px-0">
        <TTable<IActivityLog>
          listStore={store}
          columns={columns}
          emptyMessage="No trainers found."
          showPagination={true}
        /></AppCard>



    </div>

  );
}