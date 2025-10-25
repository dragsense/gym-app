// External Libraries
import React, { type ReactNode, useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TTrainerClientData } from "@shared/types/trainer-client.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import type { TrainerDto } from "@shared/dtos/trainer-dtos/trainer.dto";
import type { ClientDto } from "@shared/dtos/client-dtos/client.dto";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { useSearchableClients, useSearchableTrainers } from "@/hooks/use-searchable";
import type { TCustomInputWrapper, TFieldConfigObject } from "@/@types/form/field-config.type";

export interface ITrainerClientFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface ITrainerClientFormModalProps extends THandlerComponentProps<TFormHandlerStore<TTrainerClientData, TTrainerClientData, ITrainerClientFormModalExtraProps>> {
}

export const TrainerClientFormModal = React.memo(function TrainerClientFormModal({
  storeKey,
  store,
}: ITrainerClientFormModalProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isEditing = store((state) => state.isEditing)

  const open = store((state) => state.extra.open)
  const onClose = store((state) => state.extra.onClose)

  // React 19: Memoized fields for better performance
  const storeFields = store((state) => state.fields)

  const TrainerSelect = React.memo(
    (props: TCustomInputWrapper) => {
      return <SearchableInputWrapper<TrainerDto>
        {...props}
        modal={true}
        useSearchable={() => useSearchableTrainers({})}
        getLabel={(item) => {
          if (!item?.user?.profile) return 'Select Trainer';

          return `${item.id} - ${item.user?.profile?.firstName} ${item.user?.profile?.lastName}`
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, user: item.user } }}
        shouldFilter={false}
      />
    }
  );

  const ClientSelect = React.memo(
    (props: TCustomInputWrapper) => (
      <SearchableInputWrapper<ClientDto>
        {...props}
        modal={true}
        useSearchable={() => useSearchableClients({})}
        getLabel={(item) => {
          if (!item?.user?.profile) return 'Select Clients';
          return `${item.id} - ${item.user?.profile?.firstName} ${item.user?.profile?.lastName}`
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, user: item.user } }}
        shouldFilter={false}
      />
    )
  );

  // React 19: Memoized fields for better performance
  const fields = useMemo(() => ({
    ...storeFields,
    trainer: {
      ...storeFields.trainer,
      type: 'custom' as const,
      Component: TrainerSelect
    },
    client: {
      ...storeFields.client,
      type: 'custom' as const,
      Component: ClientSelect
    }
  } as TFieldConfigObject<TTrainerClientData>), [storeFields]);


  const inputs = useInput<TTrainerClientData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TTrainerClientData>;

  // React 19: Smooth modal state changes
  const onOpenChange = (state: boolean) => {
    if (state === false) {
      startTransition(() => {
        onClose();
      });
    }
  };

  // React 19: Memoized form buttons for better performance
  const formButtons = useMemo(() => (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          startTransition(() => {
            onClose();
          });
        }}
        data-component-id={componentId}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={false} data-component-id={componentId}>
        {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Update" : "Add"}
      </Button>
    </div>
  ), [componentId, isEditing, onClose]);

  return <>
    <ModalForm<TTrainerClientData, TTrainerClientData, ITrainerClientFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Trainer-Client Relationship`}
      description={`${isEditing ? "Edit" : "Add a new"} trainer-client relationship`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Relationship Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.trainer as ReactNode}
            {inputs.client as ReactNode}
            {inputs.status as ReactNode}
            {inputs.notes as ReactNode}
          </div>
        </div>


      </div>
    </ModalForm>
  </>
});
