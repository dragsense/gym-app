// External Libraries
import { useState } from "react";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Types
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { IQueueJob } from '@shared/interfaces';

// Store
import { type TListHandlerStore } from "@/stores";

// Components
import { AppDialog } from '@/components/layout-ui/app-dialog';
import { Button } from "@/components/ui/button";
import { removeJob } from '@/services/queue.api';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface IRemoveJobProps extends TListHandlerComponentProps<TListHandlerStore<IQueueJob, any, any>> { }

export default function RemoveJob({
  storeKey,
  store
}: IRemoveJobProps) {

  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { action, setAction, payload } = store(useShallow(state => ({
    action: state.action,
    setAction: state.setAction,
    payload: state.payload,
  })));

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      await removeJob(payload.queueName, payload.jobId);
      queryClient.invalidateQueries({ queryKey: [`${storeKey}-list`] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setAction('none');
    } catch (error) {
      console.error('Failed to remove job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={action === 'removeJob'}
      onOpenChange={(state: boolean) => {
        if (!state) {
          setAction('none');
        }
      }}>
      <DialogContent>
        <AppDialog
          title="Remove Job"
          description={`Are you sure you want to remove job "${payload?.jobId}"? This action cannot be undone.`}
        >
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAction('none')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemove}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove Job
            </Button>
          </div>
        </AppDialog>
      </DialogContent>
    </Dialog>
  );
}
