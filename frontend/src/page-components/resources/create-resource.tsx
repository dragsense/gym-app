// External Libraries
import { useId, useTransition, useMemo, useCallback } from "react";
import { useShallow } from 'zustand/shallow';
import { useQueryClient } from "@tanstack/react-query";

// Types
import type { TListHandlerComponentProps } from "@/@types/handler-types";
import type { TListHandlerStore } from "@/stores";
import type { IResource } from '@shared/interfaces';

// Components
import { FormHandler } from "@/handlers";
import { ResourceFormModal } from "@/components/admin/roles/forms/resource-form-modal";

// Services
import { createResource } from '@/services/roles.api';

// DTOs
import { CreateResourceDto } from '@shared/dtos/role-dtos';

// Types
export type TResourceFormData = {
  name: string;
  displayName: string;
  entityName: string;
  description?: string;
  isActive: boolean;
};

interface ICreateResourceProps extends TListHandlerComponentProps<TListHandlerStore<IResource, any, any>> {}

export default function CreateResource({
  storeKey,
  store
}: ICreateResourceProps) {
  const componentId = useId();
  const [, startTransition] = useTransition();
  const queryClient = useQueryClient();

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { action, setAction } = store(useShallow(state => ({
    action: state.action,
    setAction: state.setAction,
  })));

  // React 19: Memoized initial values
  const initialValues = useMemo(() => ({
    name: "",
    displayName: "",
    entityName: "",
    description: "",
    isActive: true,
  }), []);

  // React 19: Enhanced handler with transitions
  const handleClose = useCallback(() => {
    startTransition(() => {
      setAction('none');
    });
  }, [setAction, startTransition]);

  if (action !== 'createResource') return null;

  return (
    <div data-component-id={componentId}>
      <FormHandler<TResourceFormData, any>
        mutationFn={createResource}
        FormComponent={ResourceFormModal}
        storeKey={storeKey}
        initialValues={initialValues}
        dto={CreateResourceDto}
        isEditing={false}
        onSuccess={() => {
          startTransition(() => {
            queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
            handleClose();
          });
        }}
        formProps={{
          open: action === 'createResource',
          onClose: handleClose,
        }}
      />
    </div>
  );
}
