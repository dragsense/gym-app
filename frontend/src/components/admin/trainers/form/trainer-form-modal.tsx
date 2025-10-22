// External Libraries
import React, { useMemo, useId, useTransition, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TTrainerData, TUpdateTrainerData } from "@shared/types/trainer.type";
import type { TTrainerResponse } from "@shared/interfaces/trainer.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import type { TProfileData, TUserData } from "@shared/types/user.type";
import type { TFieldConfigObject } from "@/@types/form/field-config.type";
import { addRenderItem } from "@/lib/fields/dto-to-feilds";



export interface ITrainerFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface ITrainerFormModalProps extends THandlerComponentProps<TFormHandlerStore<TTrainerData, TTrainerResponse, ITrainerFormModalExtraProps>> {
}

export const TrainerFormModal = React.memo(function TrainerFormModal({
  storeKey,
  store,
}: ITrainerFormModalProps) {
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
  const storeFields = store((state) => state.fields);

  const fields = useMemo(() => {
    const renderers = {
      user: (user: FormInputs<TUserData>) => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.email as ReactNode}
            {user.isActive as ReactNode}
          </div>

          {user.profile as ReactNode}
        </div>
      ),
      profile: (profile: FormInputs<TProfileData>) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.firstName as ReactNode}
          {profile.lastName as ReactNode}
          {profile.address as ReactNode}
          {profile.phoneNumber as ReactNode}
        </div>
      ),
    };

    return addRenderItem(storeFields, renderers) as TFieldConfigObject<TTrainerData | TUpdateTrainerData>;
  }, [storeFields]);

  const inputs = useInput<TTrainerData | TUpdateTrainerData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TTrainerData | TUpdateTrainerData>;

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

  const userInputs = inputs.user;

  return <>
    <ModalForm<TTrainerData, TTrainerResponse, ITrainerFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Trainer`}
      description={`${isEditing ? "Edit" : "Add a new"} Trainer`}
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
          {userInputs as ReactNode}
        </div>


        {/* Trainer Details */}
        <div>
          <h3 className="text-sm font-semibold  mb-3">Trainer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.specialization}
            {inputs.experience}
            {inputs.certification}
            {inputs.hourlyRate}
          </div>
        </div>
      </div>
    </ModalForm>
  </>
});

