// External Libraries
import React, { useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TUserAvailabilityData } from "@shared/types/user-availability.type";
import type { IUserAvailability } from "@shared/interfaces/user-availability.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";

export interface IUserAvailabilityFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface IUserAvailabilityFormModalProps extends THandlerComponentProps<TFormHandlerStore<TUserAvailabilityData, IUserAvailability, IUserAvailabilityFormModalExtraProps>> {
}

const UserAvailabilityFormModal = React.memo(function UserAvailabilityFormModal({
  storeKey,
  store,
}: IUserAvailabilityFormModalProps) {
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
  // const fields = useMemo(() => store((state) => state.fields), [store]);

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

  return (
    <ModalForm<TUserAvailabilityData, IUserAvailability, IUserAvailabilityFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} User Availability`}
      description={`${isEditing ? "Edit" : "Add a new"} User Availability`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Weekly Schedule */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Weekly Schedule</h3>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Weekly schedule configuration will be handled by the form handler.
            </div>
          </div>
        </div>

        {/* Unavailable Periods */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Unavailable Periods</h3>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Unavailable periods configuration will be handled by the form handler.
            </div>
          </div>
        </div>
      </div>
    </ModalForm>
  );
});

export default UserAvailabilityFormModal;