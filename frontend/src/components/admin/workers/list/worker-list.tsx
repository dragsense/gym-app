// Types
import { type IWorker } from "@shared/interfaces/worker.interface";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { itemViews } from "./worker-item-views";
import { WorkerFilters } from "./worker-filters";

// Stores
import { type TListHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TWorkerListData } from "@shared/types";

export interface IWorkerListExtraProps {}

interface IWorkerListProps extends TListHandlerComponentProps<TListHandlerStore<IWorker, TWorkerListData, any>> {}

export default function WorkerList({
  storeKey,
  store
}: IWorkerListProps) {

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { columns } = itemViews({ store });

  return (
    <div className="space-y-4">
      <WorkerFilters store={store} />
      <AppCard className="px-0">
        <TTable<IWorker>
          listStore={store}
          columns={columns}
          emptyMessage="No workers found."
          showPagination={true}
        />
      </AppCard>
    </div>
  );
}
