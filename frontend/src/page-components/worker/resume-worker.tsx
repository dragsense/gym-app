// External Libraries
import { useState } from "react";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Types
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { IWorker } from '@shared/interfaces';

// Store
import { type TListHandlerStore } from "@/stores";

// Components
import { AppDialog } from '@/components/layout-ui/app-dialog';
import { Button } from "@/components/ui/button";
import { resumeWorker } from '@/services/worker.api';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface IResumeWorkerProps extends TListHandlerComponentProps<TListHandlerStore<IWorker, any, any>> { }

export default function ResumeWorker({
  storeKey,
  store
}: IResumeWorkerProps) {

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

  const handleResume = async () => {
    try {
      setIsLoading(true);
      await resumeWorker(payload);
      queryClient.invalidateQueries({ queryKey: [`${storeKey}-list`] });
      setAction('none');
    } catch (error) {
      console.error('Failed to resume worker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={action === 'resumeWorker'}
      onOpenChange={(state: boolean) => {
        if (!state) {
          setAction('none');
        }
      }}>
      <DialogContent>
        <AppDialog
          title="Resume Worker"
          description={`Are you sure you want to resume the worker "${payload}"? This will start processing tasks again.`}
        >
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAction('none')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResume}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Resume Worker
            </Button>
          </div>
        </AppDialog>
      </DialogContent>
    </Dialog>
  );
}
