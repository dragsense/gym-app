// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback, useId, useTransition, useDeferredValue } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { type IPermission } from "@shared/interfaces";

// Store
import { type TSingleHandlerStore } from "@/stores";

// Components
import { PermissionFormModal, type IPermissionFormModalExtraProps } from "@/components/admin/roles/forms/permission-form-modal";

// Services
import { createPermission, updatePermission } from "@/services/roles.api";
import { strictDeepMerge } from "@/utils";
import { CreatePermissionDto, ResourceDto, UpdatePermissionDto } from "@shared/dtos/role-dtos";
import type { TPermissionData } from '@shared/types';
import { EPermissionAction, EPermissionStatus } from '@shared/enums';


export type TPermissionExtraProps = {
  // Add any extra props needed
}

interface IPermissionFormProps extends THandlerComponentProps<TSingleHandlerStore<IPermission, TPermissionExtraProps>> { }

export default function PermissionForm({
  storeKey,
  store
}: IPermissionFormProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  const queryClient = useQueryClient();

  if (!store) {
    return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { action, response, isLoading, setAction, reset } = store(useShallow(state => ({
    action: state.action,
    response: state.response,
    isLoading: state.isLoading,
    setAction: state.setAction,
    reset: state.reset
  })));

  // React 19: Memoized initial values with deferred processing
  const initialValues = useMemo(() => {
    const INITIAL_VALUES: TPermissionData = {
      name: "",
      displayName: "",
      description: "",
      action: EPermissionAction.READ,
      status: EPermissionStatus.ACTIVE,
      resource: {} as ResourceDto,
    };
    return strictDeepMerge<TPermissionData>(INITIAL_VALUES, response ?? {});
  }, [response]);

  // React 19: Deferred values for performance
  const deferredInitialValues = useDeferredValue(initialValues);

  if (isLoading) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // React 19: Handlers with transitions
  const handleClose = useCallback(() => {
    startTransition(() => {
      reset();
      setAction('none');
    });
  }, [reset, setAction, startTransition]);

  const isEditing = !!response?.id;

  const mutationFn = isEditing ? updatePermission(response.id) : createPermission;
  const dto = isEditing ? UpdatePermissionDto : CreatePermissionDto;

  return (
    <div data-component-id={componentId}>
      <FormHandler<TPermissionData, any, IPermissionFormModalExtraProps>
        mutationFn={mutationFn}
        FormComponent={PermissionFormModal}
        storeKey={storeKey}
        initialValues={deferredInitialValues}
        dto={dto}
        validationMode={EVALIDATION_MODES.OnSubmit}
        isEditing={isEditing}
        onSuccess={() => {
          startTransition(() => {
            queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
            handleClose();
          });
        }}
        formProps={{
          open: action === 'createOrUpdate',
          onClose: handleClose,
        }}
      />
    </div>
  );
}
