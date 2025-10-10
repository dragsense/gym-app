// External Libraries
import React from "react";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { THandlerComponentProps } from "@/@types/handler-types";
import type { IMessageResponse } from "@shared/interfaces/api/response.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { TFileUploadData } from "@shared/types";
import { FormErrors } from "@/components/shared-ui/form-errors";

export interface IFileFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}


interface IFileFormModalProps extends THandlerComponentProps<TFormHandlerStore<TFileUploadData, IMessageResponse, IFileFormModalExtraProps>> { }

const FileCreateFormModal = React.memo(function FileCreateModal({
  storeKey,
  store,
}: IFileFormModalProps) {

  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const open = store((state) => state.extra.open);
  const onClose = store((state) => state.extra.onClose);
  const fields = store((state) => state.fields);

  const inputs = useInput<TFileUploadData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TFileUploadData>;

  const onOpenChange = (state: boolean) => {
    if (state === false) onClose();
  };

  const formButtons = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={false}>
        {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create File
      </Button>
    </div>
  );

  return (
    <ModalForm<TFileUploadData, IMessageResponse, IFileFormModalExtraProps>
      title="Create File Record"
      description="Create a file record with custom URL"
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">File Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputs.name}
            {inputs.type}
          </div>
        </div>

        {/* URL & Path Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Path & Location</h3>
          <div className="grid grid-cols-1 gap-4">
            {inputs.file as React.ReactNode}
            {inputs.folder}
            {inputs.url}
          </div>
        </div>
    <FormErrors />
      </div>
    </ModalForm>
  );
});

export default FileCreateFormModal;

