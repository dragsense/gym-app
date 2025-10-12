// External Libraries
import { useCallback, useMemo, useId, useTransition, useDeferredValue } from "react";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";


// Types
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { IQueue } from '@shared/interfaces';

// Store
import { type TListHandlerStore } from "@/stores";

// Components
import { AppDialog } from '@/components/layout-ui/app-dialog';
import { Button } from "@/components/ui/button";
import { cleanQueue } from '@/services/queue.api';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ICleanQueueProps extends TListHandlerComponentProps<TListHandlerStore<IQueue, any, any>> { }

export default function CleanQueue({
  storeKey,
  store
}: ICleanQueueProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [isPending, startTransition] = useTransition();
  
  const queryClient = useQueryClient();

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { action, setAction, payload } = store(useShallow(state => ({
    action: state.action,
    setAction: state.setAction,
    payload: state.payload,
  })));

  // React 19: Deferred payload for better performance
  const deferredPayload = useDeferredValue(payload);

  // React 19: Enhanced async handler with transitions
  const handleClean = useCallback(async () => {
    startTransition(async () => {
      try {
        await cleanQueue(deferredPayload);
        queryClient.invalidateQueries({ queryKey: [`${storeKey}-list`] });
        setAction('none');
      } catch (error) {
        console.error('Failed to clean queue:', error);
      }
    });
  }, [deferredPayload, queryClient, storeKey, setAction, startTransition]);

  // React 19: Enhanced dialog props with transitions
  const dialogProps = useMemo(() => ({
    open: action === 'cleanQueue',
    onOpenChange: (state: boolean) => {
      startTransition(() => {
        if (!state) {
          setAction('none');
        }
      });
    }
  }), [action, setAction, startTransition]);

  return (
    <div 
      data-component-id={componentId}
    >
      <Dialog {...dialogProps}>
        <DialogContent>
          <AppDialog
            title="Clean Queue"
            description={`Are you sure you want to clean the queue "${deferredPayload}"? This will remove all completed and failed jobs.`}
          >
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => startTransition(() => setAction('none'))}
                disabled={isPending}
              >
                Cancel
              </Button>
            <Button
              onClick={handleClean}
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Clean Queue
            </Button>
            </div>
          </AppDialog>
        </DialogContent>
      </Dialog>
    </div>
  );
}