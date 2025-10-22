// External Libraries
import { useId, useMemo, useTransition } from "react";
import { useShallow } from 'zustand/shallow';

// Types
import type { TListHandlerComponentProps } from "@/@types/handler-types";
import type { TListHandlerStore } from "@/stores";
import type { IResource } from '@shared/interfaces';

// Components
import { Table as TTable } from "@/components/table-ui/table";
import { AppCard } from "@/components/layout-ui/app-card";
import { ResourceFilters } from "./resource-filters";
import { itemViews } from "./resource-item-views";

// Types
export type TResourceListData = IResource;
export interface TResourceListExtraProps {
  // Add any extra props needed for resource list
}

interface IResourceListProps extends TListHandlerComponentProps<TListHandlerStore<IResource, TResourceListData, TResourceListExtraProps>> {}

export const ResourceList = ({
  storeKey,
  store
}: IResourceListProps) => {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const setAction = store(state => state.setAction);

  // React 19: Smooth resource actions
  const editResource = (resourceId: number) => {
    startTransition(() => {
      setAction('editResource', { resourceId });
    });
  };
  
  const deleteResource = (resourceId: number) => {
    startTransition(() => {
      setAction('deleteResource', { resourceId });
    });
  };

  // React 19: Memoized columns for better performance
  const { columns } = useMemo(() => itemViews({ editResource, deleteResource }), [editResource, deleteResource]);

  return (
    <div className="space-y-4" data-component-id={componentId}>
      <ResourceFilters store={store} />
      
      <AppCard className="px-0">
        <TTable<IResource>
          listStore={store}
          columns={columns}
          emptyMessage="No resources found."
          showPagination={true}
        />
      </AppCard>
    </div>
  );
}
