// External Libraries
import { useShallow } from 'zustand/shallow';

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
    
    const JOB_STORE_KEY = storeKey + '-job';

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, payload, setAction } = store(useShallow(state => ({
        action: state.action,
        setAction: state.setAction,
        payload: state.payload,
    })));


    return (
        <Dialog
            open={action === 'viewJobs'}
            onOpenChange={(state: boolean) => {
                if (!state) {
                    setAction('none');
                }
            }}>
            <DialogContent>
                <AppDialog
                    title="Queue Jobs"
                    description="List of jobs in the queue"
                >
                    <ListHandler<IQueueJob, TJobListData, TJobListExtraProps>
                        queryFn={(params) => fetchJobs(payload, params)}
                        ListComponent={JobList}
                        storeKey={JOB_STORE_KEY}
                        listProps={{ queueName: payload }}
                         actionComponents={[
                            {
                                action: 'retryJob',
                                comp: RetryJob,
                            },
                            {
                                action: 'removeJob',
                                comp: RemoveJob,
                            },
                        ]} 
                    />
                </AppDialog>
            </DialogContent>
        </Dialog>

    );
}

