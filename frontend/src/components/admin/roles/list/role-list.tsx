// External Libraries
import { useId, useMemo, useTransition } from "react";
import { useShallow } from 'zustand/shallow';

// Types
import type { TListHandlerComponentProps } from "@/@types/handler-types";
import type { TListHandlerStore } from "@/stores";
import type { IRole } from '@shared/interfaces';

// Components
import { Table as TTable } from "@/components/table-ui/table";
import { AppCard } from "@/components/layout-ui/app-card";
import { RoleFilters } from "./role-filters";
import { itemViews } from "./role-item-views";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Types
export type TRoleListData = IRole;
export interface TRoleListExtraProps {
  // Add any extra props needed for role list
}

interface IRoleListProps extends TListHandlerComponentProps<TListHandlerStore<IRole, TRoleListData, TRoleListExtraProps>> { }

export const RoleList = ({
  storeKey,
  store,
  singleStore
}: IRoleListProps) => {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  if (!singleStore) {
    return <div>Single store "{singleStore}" not found. Did you forget to register it?</div>;
  }

  const setAction = singleStore(state => state.setAction);

  const handleCreate = () => {
    startTransition(() => {
      setAction('createOrUpdate');
    });
  };

  // React 19: Smooth role actions
  const editRole = (roleId: number) => {
    startTransition(() => {
      setAction('editRole', { roleId });
    });
  };

  const deleteRole = (roleId: number) => {
    startTransition(() => {
      setAction('deleteRole', { roleId });
    });
  };

  const viewPermissions = (roleId: number) => {
    startTransition(() => {
      setAction('viewPermissions', { roleId });
    });
  };

  // React 19: Memoized columns for better performance
  const { columns } = useMemo(() => itemViews({ editRole, deleteRole, viewPermissions }), [editRole, deleteRole, viewPermissions]);

  return (
    <div className="space-y-4" data-component-id={componentId}>

      <div className="flex flex-1 justify-between items-start md:items-center gap-2 flex-wrap">
        <RoleFilters store={store} />
        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            variant="default"
            data-component-id={componentId}
          >
            <Plus /> <span className="hidden sm:inline">Create Role</span>
          </Button>
        </div>
      </div>

      <AppCard className="px-0">
        <TTable<IRole>
          listStore={store}
          columns={columns}
          emptyMessage="No roles found."
          showPagination={true}
        />
      </AppCard>
    </div>
  );
}
