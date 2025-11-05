// External Libraries
import React, { type ReactNode, useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TSessionData } from "@shared/types/session.type";
import type { ISessionResponse } from "@shared/interfaces/session.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import type { TCustomInputWrapper, TFieldConfigObject } from "@/@types/form/field-config.type";
import type { ClientDto, TrainerDto } from "@shared/dtos";
import type { ReminderDto } from "@shared/dtos/reminder-dtos";
import { useSearchableClients, useSearchableTrainers } from "@/hooks/use-searchable";
import { useAuthUser } from "@/hooks/use-auth-user";
import { EUserLevels } from "@shared/enums";

export interface ISessionFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface ISessionFormModalProps extends THandlerComponentProps<TFormHandlerStore<TSessionData, ISessionResponse, ISessionFormModalExtraProps>> {
}

const SessionFormModal = React.memo(function SessionFormModal({
  storeKey,
  store,
}: ISessionFormModalProps) {

  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  const { user } = useAuthUser()

  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isSubmitting = store((state) => state.isSubmitting)
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
          if (!item?.user?.firstName) return 'Select Trainer'
          return `${item.user?.firstName} ${item.user?.lastName} (${item.user?.email})`
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, user: item.user } }}
        shouldFilter={false}
      />
    }
  );

  const ClientsSelect = React.memo(
    (props: TCustomInputWrapper) => (
      <SearchableInputWrapper<ClientDto>
        {...props}
        modal={true}
        useSearchable={() => useSearchableClients({})}
        getLabel={(item) => {
          if (!item?.user?.firstName) return 'Select Clients'

          return `${item.user?.firstName} ${item.user?.lastName} (${item.user?.email})`
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, user: item.user } }}
        shouldFilter={false}
        multiple={true}
      />
    )
  );

  // React 19: Memoized fields for better performance
  const fields = useMemo(() => ({
    ...storeFields,
    trainer: {
      ...storeFields.trainer,
      type: 'custom' as const,
      Component: TrainerSelect,
      visible: () => user?.level !== EUserLevels.TRAINER
    },
    clients: {
      ...storeFields.clients,
      type: 'custom' as const,
      Component: ClientsSelect
    },

    reminderConfig: {
      ...storeFields.reminderConfig,
      visible: (ctx: { values: Record<string, any> }) => ctx.values.enableReminder,
      renderItem: (items: ReminderDto) => {
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.sendBefore as ReactNode}
          {items.reminderTypes as ReactNode}
        </div>
      }
    },
  } as TFieldConfigObject<TSessionData>), [storeFields]);

  const inputs = useInput<TSessionData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TSessionData>;

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
      <Button type="submit" disabled={isSubmitting} data-component-id={componentId}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Update" : "Add"}
      </Button>
    </div>
  ), [componentId, isEditing, onClose, isSubmitting]);

  return <>
    <ModalForm<TSessionData, ISessionResponse, ISessionFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Session`}
      description={`${isEditing ? "Edit" : "Add a new"} training session`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Session Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Session Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.title}
            {inputs.type}
          </div>
          <div className="mt-6">
            {inputs.description}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.startDateTime}
            {inputs.duration}
          </div>
        </div>

        {/* Participants */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Participants</h3>
          <div className="grid grid-cols-2 gap-6 items-start">
            {inputs.trainer as ReactNode}
            {inputs.clients as ReactNode}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.location}
            {inputs.price}
          </div>
          <div className="mt-6">
            {inputs.notes}
          </div>
        </div>

        {/* Reminders */}
        <div>

          <div className="space-y-4">

            {inputs.enableReminder}
            {inputs.reminderConfig as ReactNode}
          </div>

        </div>
      </div>
    </ModalForm >
  </>
});

export default SessionFormModal;