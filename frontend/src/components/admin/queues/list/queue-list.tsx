// Types
import { type IQueue } from "@shared/interfaces/queue.interface";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { itemViews } from "./queue-item-views";
import { QueueFilters } from "./queue-filters";

// Stores
import { type TListHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TQueueListData } from "@shared/types";

export interface IQueueListExtraProps {}

interface IQueueListProps extends TListHandlerComponentProps<TListHandlerStore<IQueue, TQueueListData, any>> {}

export default function QueueList({
  storeKey,
  store
}: IQueueListProps) {

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { columns } = itemViews({ store });


  return (
    <div className="space-y-4">
      <QueueFilters store={store} />
      <AppCard className="px-0">
        <TTable<IQueue>
          listStore={store}
          columns={columns}
          emptyMessage="No queues found."
          showPagination={true}
        />
      </AppCard>
    </div>
  );
}