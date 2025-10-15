// External Libraries
import { useId, useMemo, useTransition } from "react";

// Types
import type { TListHandlerComponentProps } from "@/@types/handler-types";
import type { TListHandlerStore } from "@/stores";
import type { IPermission } from '@shared/interfaces';

// Components
import { Table as TTable } from "@/components/ui/table";
import { AppCard } from "@/components/layout-ui/app-card";
import { PermissionFilters } from "./permission-filters";
import { itemViews } from "./permission-item-views";

// Types
export type TPermissionListData = IPermission;
export interface TPermissionListExtraProps {
  // Add any extra props needed for permission list
}

interface IPermissionListProps extends TListHandlerComponentProps<TListHandlerStore<IPermission, TPermissionListData, TPermissionListExtraProps>> {}

export default function PermissionList({
  storeKey,
  store
}: IPermissionListProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const setAction = store(state => state.setAction);

  // React 19: Smooth permission actions
  const editPermission = (permissionId: number) => {
    startTransition(() => {
      setAction('editPermission', { permissionId });
    });
  };
  
  const deletePermission = (permissionId: number) => {
    startTransition(() => {
      setAction('deletePermission', { permissionId });
    });
  };

  // React 19: Memoized columns for better performance
  const { columns } = useMemo(() => itemViews({ editPermission, deletePermission }), [editPermission, deletePermission]);

  return (
    <div className="space-y-4" data-component-id={componentId}>
      <PermissionFilters store={store} />
      
      <AppCard className="px-0">
        <TTable<IPermission>
          listStore={store}
          columns={columns}
          emptyMessage="No permissions found."
          showPagination={true}
        />
      </AppCard>
    </div>
  );
}
