// External Libraries
import React, { type ReactNode, useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TBillingData } from "@shared/types/billing.type";
import type { IBillingResponse } from "@shared/interfaces/billing.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { useSearchableUsers } from "@/hooks/use-searchable";
import type { TCustomInputWrapper, TFieldConfigObject } from "@/@types/form/field-config.type";
import type { ReminderDto } from "@shared/dtos/reminder-dtos";
import type { UserDto } from "@shared/dtos";
import { EUserLevels } from "@shared/enums";

export interface IBillingFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface IBillingFormModalProps extends THandlerComponentProps<TFormHandlerStore<TBillingData, IBillingResponse, IBillingFormModalExtraProps>> {
}

const BillingFormModal = React.memo(function BillingFormModal({
  storeKey,
  store,
}: IBillingFormModalProps) {
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

  const RecipientUserSelect = React.memo(
    (props: TCustomInputWrapper) => {
      return <SearchableInputWrapper<UserDto>
        {...props}
        modal={true}
        useSearchable={() => useSearchableUsers({ level: EUserLevels.CLIENT })}
        getLabel={(item) => {
          if (!item?.profile) return 'Select Recipient'
          return `${item.id} - ${item.profile?.firstName} ${item.profile?.lastName}`
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, profile: item.profile } }}
        shouldFilter={false}
      />
    }
  );


  // React 19: Memoized fields for better performance
  const fields = useMemo(() => ({
    ...storeFields,
    recipientUser: {
      ...storeFields.recipientUser,
      type: 'custom' as const,
      Component: RecipientUserSelect
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
  } as TFieldConfigObject<TBillingData>), [storeFields]);

  const inputs = useInput<TBillingData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TBillingData>;

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
    <ModalForm<TBillingData, IBillingResponse, IBillingFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Billing`}
      description={`${isEditing ? "Edit" : "Add a new"} billing record`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Billing Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Billing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.title}
            {inputs.type}
          </div>
          <div className="mt-6">
            {inputs.description}
          </div>
        </div>

        {/* Amount and Due Date */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.amount}
            {inputs.dueDate}
          </div>
        </div>

        {/* Participants */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Participants</h3>
          <div className="grid grid-cols-2 gap-6 items-start">
            {inputs.recipientUser as ReactNode}
          </div>
        </div>

        {/* Recurring Options */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Recurring Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.recurrence}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Additional Details</h3>
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

export default BillingFormModal;
