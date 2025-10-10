
// External Libraries
import React from "react";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TUpdateProfileData } from "@shared/types/user.type";
import type { IMessageResponse } from "@shared/interfaces/api/response.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import FileUpload from "@/components/shared-ui/file-upload";
import type { IFileUpload } from "@shared/interfaces/file-upload.interface";
import MultiFileUpload from "@/components/shared-ui/multi-file-upload";
import type { TFieldConfigObject } from "@/@types/form/field-config.type";



export interface IProfileFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface IProfileFormModalProps extends THandlerComponentProps<TFormHandlerStore<TUpdateProfileData, IMessageResponse, IProfileFormModalExtraProps>> {
}

const ProfileFormModal = React.memo(function ProfileFormModal({
  storeKey,
  store,
}: IProfileFormModalProps) {


  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const open = store((state) => state.extra.open)
  const onClose = store((state) => state.extra.onClose)


  const storeFields = store((state) => state.fields)

  const fields = {
    ...storeFields,
    image: {
      ...storeFields.image,
      type: 'custom' as const,
      Component: ({value, onChange}: {value: File | IFileUpload | null, onChange: (file: File | null) => void}) => <FileUpload value={value} onChange={onChange} />
    },
    documents: {
      ...storeFields.documents,
      type: 'custom' as const,
      Component: ({value, onChange}: {value: File[] | IFileUpload[] | undefined, onChange: (file: File[] | null) => void}) => <MultiFileUpload value={value} onChange={onChange} />
    }
  } as TFieldConfigObject<TUpdateProfileData>;

  const inputs = useInput<TUpdateProfileData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TUpdateProfileData>;


  const onOpenChange = (state: boolean) => {
    if (state === false)
      onClose();
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
        Update Profile
      </Button>
    </div>
  );


  return <>
    <ModalForm<TUpdateProfileData, IMessageResponse, IProfileFormModalExtraProps>
      title="Edit Profile"
      description="Update your profile information"
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
            {inputs.firstName}
            {inputs.lastName}
            {inputs.phoneNumber}
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.gender}
            {inputs.dateOfBirth}
            {inputs.address}
          </div>
        </div>

        {/* Profile Image */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Profile Image</h3>
          <div className="grid grid-cols-1 gap-6 items-start">
            {inputs.image as React.ReactNode}
          </div>
        </div>

        {/* Documents */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Documents (Max 10)</h3>
          <div className="grid grid-cols-1 gap-6 items-start">
            {inputs.documents as React.ReactNode}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Skills</h3>
          <div className="grid grid-cols-1 gap-6 items-start">
            {inputs.skills as React.ReactNode}
          </div>
        </div>

      </div>
    </ModalForm>

  </>
});

export default ProfileFormModal;

