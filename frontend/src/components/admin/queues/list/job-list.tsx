// React & Hooks
import { useId, useMemo, useTransition } from "react";

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
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const setAction = store(state => state.setAction);
  const queueName = store(state => state.extra.queueName);

  // React 19: Smooth job actions
  const retryJob = (jobId: string) => {
    startTransition(() => {
      setAction('retryJob', { queueName, jobId });
    });
  };
  
  const removeJob = (jobId: string) => {
    startTransition(() => {
      setAction('removeJob', { queueName, jobId });
    });
  };

  // React 19: Memoized columns for better performance
  const { columns } = useMemo(() => itemViews({ retryJob, removeJob }), [retryJob, removeJob]);

  return (
    <div className="space-y-4" data-component-id={componentId}>
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
