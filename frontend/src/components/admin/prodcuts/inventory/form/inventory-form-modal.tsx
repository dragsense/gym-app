// External Libraries
import React, { useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TInventoryData } from "@shared/types/products/inventory.type";
import type { IInventoryResponse } from "@shared/interfaces/products/inventory.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import type { TFieldConfigObject } from "@/@types/form/field-config.type";

export interface IInventoryFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface IInventoryFormModalProps extends THandlerComponentProps<TFormHandlerStore<TInventoryData, IInventoryResponse, IInventoryFormModalExtraProps>> {
}

const InventoryFormModal = React.memo(function InventoryFormModal({
  storeKey,
  store,
}: IInventoryFormModalProps) {

  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isSubmitting = store((state) => state.isSubmitting)
  const isEditing = store((state) => state.isEditing)

  const open = store((state) => state.extra.open)
  const onClose = store((state) => state.extra.onClose)

  // React 19: Memoized fields for better performance
  const storeFields = store((state) => state.fields)

  // React 19: Memoized fields for better performance
  const fields = useMemo(() => ({
    ...storeFields,
  } as TFieldConfigObject<TInventoryData>), [storeFields]);

  const inputs = useInput<TInventoryData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TInventoryData>;

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
    <ModalForm<TInventoryData, IInventoryResponse, IInventoryFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Inventory`}
      description={`${isEditing ? "Edit" : "Add a new"} inventory`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Inventory Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Inventory Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.name}
            {inputs.type}
          </div>
          <div className="mt-6">
            {inputs.description}
          </div>
        </div>

        {/* Inventory Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Inventory Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.unit}
            {inputs.quantity}
          </div>
        </div>


      </div>
    </ModalForm >
  </>
});

export default InventoryFormModal;