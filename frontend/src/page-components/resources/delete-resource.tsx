// External Libraries
import { useId } from "react";

// Types
import type { TListHandlerComponentProps } from "@/@types/handler-types";
import type { TListHandlerStore } from "@/stores";
import type { IResource } from '@shared/interfaces';

// Components
import { AppDialog } from "@/components/layout-ui/app-dialog";

interface IDeleteResourceProps extends TListHandlerComponentProps<TListHandlerStore<IResource, any, any>> {}

export default function DeleteResource({
  storeKey,
  store
}: IDeleteResourceProps) {
  const componentId = useId();

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { action, setAction } = store(state => ({
    action: state.action,
    setAction: state.setAction,
  }));

  if (action !== 'deleteResource') return null;

  return (
    <AppDialog
      title="Delete Resource"
      description="Are you sure you want to delete this resource?"
      open={action === 'deleteResource'}
      onOpenChange={(open) => !open && setAction('none')}
    >
      <div data-component-id={componentId}>
        <p>Delete resource confirmation will be implemented here</p>
        <button onClick={() => setAction('none')}>Close</button>
      </div>
    </AppDialog>
  );
}
