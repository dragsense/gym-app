// External Libraries
import React, { useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TRoleFormData } from "@/page-components/roles/role-form";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";

export interface IRoleFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface IRoleFormModalProps extends THandlerComponentProps<TFormHandlerStore<TRoleFormData, any, IRoleFormModalExtraProps>> {}

const RoleFormModal = React.memo(function RoleFormModal({
  storeKey,
  store,
}: IRoleFormModalProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isEditing = store((state) => state.isEditing);
  const open = store((state) => state.extra.open);
  const onClose = store((state) => state.extra.onClose);

  // React 19: Memoized fields for better performance
  const fields = useMemo(() => store((state) => state.fields), [store]);

  const inputs = useInput<TRoleFormData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TRoleFormData>;

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
    <>
      <ModalForm<TRoleFormData, any, IRoleFormModalExtraProps>
        title={`${isEditing ? "Edit" : "Add"} Role`}
        description={`${isEditing ? "Edit" : "Add a new"} Role`}
        open={open}
        onOpenChange={onOpenChange}
        formStore={store}
        footerContent={formButtons}
        width="2xl"
      >
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.name}
            {inputs.code}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Additional Details</h3>
          <div className="grid grid-cols-1 gap-6 items-start">
            {inputs.description}
            {inputs.status}
            {inputs.isSystem}
          </div>
        </div>
      </div>
      </ModalForm>
    </>
  );
});

export default RoleFormModal;