
// External Libraries
import React, { useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TUserData, TUpdateUserData, TProfileData } from "@shared/types/user.type";
import type { TUserResponse } from "@shared/interfaces/user.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import type { TFieldConfigObject } from "@/@types/form/field-config.type";



export interface IUserFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface IUserFormModalProps extends THandlerComponentProps<TFormHandlerStore<TUserData, TUserResponse, IUserFormModalExtraProps>> {
}

const UserFormModal = React.memo(function UserFormModal({
  storeKey,
  store,
}: IUserFormModalProps) {
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

  // React 19: Memoized fields for better performance
  const fields = useMemo(() => ({
    ...storeFields,
    profile: {
      ...storeFields.profile,
      renderItem: (item: TProfileData) => (
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {item.firstName}
            {item.lastName}
            {item.phoneNumber}
            {item.gender}
            {item.dateOfBirth}
            {item.address}
          </div>
        </div>
      )
    },

  } as TFieldConfigObject<TUserData>), [storeFields]);

  const inputs = useInput<TUserData | TUpdateUserData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TUserData | TUpdateUserData>;


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
    <ModalForm<TUserData, TUserResponse, IUserFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} User`}
      description={`${isEditing ? "Edit" : "Add a new"} User`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.email}
            {inputs.isActive}
          </div>
          <div className="w-full">
            {inputs.profile as React.ReactNode}
          </div>
        </div>
      </div>
    </ModalForm>

  </>
});

export default UserFormModal;
