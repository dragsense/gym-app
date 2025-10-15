// External Libraries
import React, { useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TClientData, TUpdateClientData, TProfileData } from "@shared/types/client.type";
import type { TClientResponse } from "@shared/interfaces/client.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";

export interface IClientFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface IClientFormModalProps extends THandlerComponentProps<TFormHandlerStore<TClientData, TClientResponse, IClientFormModalExtraProps>> {
}

export const ClientFormModal = React.memo(function ClientFormModal({
  storeKey,
  store,
}: IClientFormModalProps) {
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

  const inputs = useInput<TClientData | TUpdateClientData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TClientData | TUpdateClientData>;

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

  const userInputs = inputs.user as FormInputs<TUserData>;
  const profileInputs = userInputs.profile as FormInputs<TProfileData>;

  return <>
    <ModalForm<TClientData, TClientResponse, IClientFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Client`}
      description={`${isEditing ? "Edit" : "Add a new"} Client`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
          {/* Basic Info */}
          <div>
          <h3 className="text-sm font-semibold mb-3">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
           {userInputs.email}
           {userInputs.isActive}
           {profileInputs.firstName}
           {profileInputs.lastName}
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h3 className="text-sm font-semibold  mb-3">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {profileInputs.phoneNumber}
            {profileInputs.gender}
            {profileInputs.dateOfBirth}
            {profileInputs.address}
          </div>
        </div>

        {/* Trainer Details */}
        <div>
          <h3 className="text-sm font-semibold  mb-3">Trainer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.goal}
            {inputs.fitnessLevel}
            {inputs.medicalConditions}
          </div>
        </div>
      </div>
    </ModalForm>
  </>
});

