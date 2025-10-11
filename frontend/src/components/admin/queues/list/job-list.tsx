// Types
import { type IQueueJob } from "@shared/interfaces/queue.interface";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { itemViews } from "./job-item-views";
import { JobFilters } from "./job-filters";

// Stores
import { type TListHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TJobListData } from "@shared/types";

export type TJobListExtraProps = {
  queueName: string;
}

interface IJobListProps extends TListHandlerComponentProps<TListHandlerStore<IQueueJob, TJobListData, TJobListExtraProps>> {
}

export default function JobList({
  storeKey,
  store
}: IJobListProps) {

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const setAction = store(state => state.setAction);
  const queueName = store(state => state.extra.queueName);

  const retryJob = (jobId: string) => {
    setAction('retryJob', { queueName, jobId });
  };
  const removeJob = (jobId: string) => {
    setAction('removeJob', { queueName, jobId });
  };

  const { columns } = itemViews({ retryJob, removeJob });

  return (
    <div className="space-y-4">
      <JobFilters store={store} />
      
      <AppCard className="px-0">
        <TTable<IQueueJob>
          listStore={store}
          columns={columns}
          emptyMessage="No jobs found."
          showPagination={true}
        />
      </AppCard>
    </div>
  );
}
