// External Libraries
import { useId } from "react";

// Types
import type { TListHandlerComponentProps } from "@/@types/handler-types";
import type { TListHandlerStore } from "@/stores";
import type { IResource } from '@shared/interfaces';

// Components
import { AppDialog } from "@/components/layout-ui/app-dialog";

interface IEditResourceProps extends TListHandlerComponentProps<TListHandlerStore<IResource, any, any>> {}

export default function EditResource({
  storeKey,
  store
}: IEditResourceProps) {
  const componentId = useId();

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { action, setAction } = store(state => ({
    action: state.action,
    setAction: state.setAction,
  }));

  if (action !== 'editResource') return null;

  return (
    <AppDialog
      title="Edit Resource"
      description="Edit resource details"
      open={action === 'editResource'}
      onOpenChange={(open) => !open && setAction('none')}
    >
      <div data-component-id={componentId}>
        <p>Edit resource form will be implemented here</p>
        <button onClick={() => setAction('none')}>Close</button>
      </div>
    </AppDialog>
  );
}
