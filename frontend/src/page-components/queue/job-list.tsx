// External Libraries
import { useShallow } from 'zustand/shallow';
import { useMemo, useCallback, useTransition, useDeferredValue } from "react";

// Handlers
import { ListHandler } from "@/handlers";

// Types
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { IQueue, IQueueJob } from '@shared/interfaces';

// Store
import { type TListHandlerStore } from "@/stores";

// Components
import { JobList } from "@/components/admin";
import type { TJobListData } from '@shared/types';
import { fetchJobs } from '@/services/queue.api';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import { AppDialog } from '@/components/layout-ui/app-dialog';
import type { TJobListExtraProps } from '@/components/admin/queues/list/job-list';
import RetryJob from './retry-job';
import RemoveJob from './remove-job';

// Services


interface IJobListProps extends TListHandlerComponentProps<TListHandlerStore<IQueue, any, any>> { }

export default function QueueJobList({
    storeKey,
    store,
}: IJobListProps) {
    // React 19: Essential transitions
    const [, startTransition] = useTransition();
    
    const JOB_STORE_KEY = storeKey + '-job';

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, payload, setAction } = store(useShallow(state => ({
        action: state.action,
        setAction: state.setAction,
        payload: state.payload,
    })));

    // React 19: Deferred payload for performance
    const deferredPayload = useDeferredValue(payload);

    // React 19: Enhanced dialog props with transitions
    const dialogProps = useMemo(() => ({
        open: action === 'viewJobs',
        onOpenChange: (state: boolean) => {
            startTransition(() => {
                if (!state) {
                    setAction('none');
                }
            });
        }
    }), [action, setAction, startTransition]);

    // React 19: Memoized action components
    const actionComponents = useMemo(() => [
        {
            action: 'retryJob',
            comp: RetryJob,
        },
        {
            action: 'removeJob',
            comp: RemoveJob,
        },
    ], []);

    // React 19: Enhanced query function with deferred payload
    const queryFn = useCallback((params: any) => fetchJobs(deferredPayload, params), [deferredPayload]);

    return (
        <Dialog {...dialogProps}>
            <DialogContent>
                <AppDialog
                    title="Queue Jobs"
                    description="List of jobs in the queue"
                >
                    <ListHandler<IQueueJob, TJobListData, TJobListExtraProps>
                        queryFn={queryFn}
                        ListComponent={JobList}
                        storeKey={JOB_STORE_KEY}
                        listProps={{ queueName: deferredPayload }}
                        actionComponents={actionComponents} 
                    />
                </AppDialog>
            </DialogContent>
        </Dialog>

    );
}

