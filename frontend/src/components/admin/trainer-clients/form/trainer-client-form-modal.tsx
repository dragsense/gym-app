// External Libraries
import React, { useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TTrainerClientData, TUpdateTrainerClientData } from "@shared/types/trainer-client.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import type { ITrainerClient } from "@shared/interfaces/trainer-client.interface";

export interface ITrainerClientFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface ITrainerClientFormModalProps extends THandlerComponentProps<TFormHandlerStore<TTrainerClientData, ITrainerClient, ITrainerClientFormModalExtraProps>> {
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
  const fields = useMemo(() => store((state) => state.fields), [store]);

  const inputs = useInput<TTrainerClientData | TUpdateTrainerClientData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TTrainerClientData | TUpdateTrainerClientData>;

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
    <ModalForm<TTrainerClientData, ITrainerClient, ITrainerClientFormModalExtraProps>
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
            {inputs.trainerId}
            {inputs.clientId}
            {inputs.status}
            {inputs.startDate}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.endDate}
            {inputs.notes}
          </div>
        </div>
      </div>
    </ModalForm>
  </>
});
