// External Libraries
import { useShallow } from 'zustand/shallow';
import { useMemo, useCallback, useTransition, useDeferredValue } from "react";

// Handlers
import { ListHandler } from "@/handlers";

// Types
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { IRole, IPermission } from '@shared/interfaces';

// Store
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";

// Components
import { PermissionList } from "@/components/admin/roles/list/permission-list";
import type { TPermissionListData } from '@/components/admin/roles/list/permission-list';
import { fetchPermissionsByRole } from '@/services/roles.api';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import { AppDialog } from '@/components/layout-ui/app-dialog';
import type { TPermissionListExtraProps } from '@/components/admin/roles/list/permission-list';

interface IViewRolePermissionsProps extends TListHandlerComponentProps<TSingleHandlerStore<IRole, any>> {}

export default function ViewRolePermissions({
  storeKey,
  store
}: IViewRolePermissionsProps) {
  // React 19: Essential transitions
  const [, startTransition] = useTransition();
  
  const PERMISSION_STORE_KEY = storeKey + '-permissions';

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
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
    open: action === 'viewPermissions',
    onOpenChange: (state: boolean) => {
      startTransition(() => {
        if (!state) {
          setAction('none');
        }
      });
    }
  }), [action, setAction, startTransition]);

  // React 19: Enhanced query function with deferred payload
  const queryFn = useCallback((params: any) => {
    // Fetch permissions by role ID
    return fetchPermissionsByRole(deferredPayload?.roleId, params);
  }, [deferredPayload]);

  return (
    <Dialog {...dialogProps}>
      <DialogContent>
        <AppDialog
          title="Role Permissions"
          description="List of permissions for this role"
        >
          <ListHandler<IPermission, TPermissionListData, TPermissionListExtraProps>
            queryFn={queryFn}
            ListComponent={PermissionList}
            storeKey={PERMISSION_STORE_KEY}
            listProps={{ roleId: deferredPayload?.roleId }}
          />
        </AppDialog>
      </DialogContent>
    </Dialog>
  );
}