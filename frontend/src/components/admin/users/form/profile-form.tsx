// External Libraries
import React, { useId, useMemo } from "react";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TUpdateProfileData } from "@shared/types/user.type";
import type { THandlerComponentProps } from "@/@types/handler-types";
import type { TFieldConfigObject } from "@/@types/form/field-config.type";
import type { IFileUpload } from "@shared/interfaces/file-upload.interface";

// Components
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/layout-ui/app-card";
import FileUpload from "@/components/shared-ui/file-upload";
import MultiFileUpload from "@/components/shared-ui/multi-file-upload";
import { FormErrors } from "@/components/shared-ui/form-errors";

interface IProfileFormProps extends THandlerComponentProps<TFormHandlerStore<TUpdateProfileData, any, any>> { }

export default function ProfileForm({
  storeKey,
  store,
}: IProfileFormProps) {
  // React 19: Essential IDs
  const componentId = useId();

  if (!store) {
    return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const isSubmitting = store((state) => state.isSubmitting);
  const storeFields = store((state) => state.fields);

  // React 19: Memoized fields for better performance
  const fields = useMemo(() => ({
    ...storeFields,
    image: {
      ...storeFields.image,
      type: 'custom' as const,
      Component: ({ value, onChange }: { value: File | IFileUpload | null, onChange: (file: File | null) => void }) => <FileUpload value={value} onChange={onChange} />
    },
    documents: {
      ...storeFields.documents,
      type: 'custom' as const,
      Component: ({ value, onChange }: { value: File[] | IFileUpload[] | undefined, onChange: (file: File[] | null) => void }) => <MultiFileUpload value={value} onChange={onChange} />
    }
  } as TFieldConfigObject<TUpdateProfileData>), [storeFields]);

  const inputs = useInput<TUpdateProfileData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TUpdateProfileData>;

  return (
    <div data-component-id={componentId} className="space-y-6">

      <AppCard

        header={<>
          <h2 className="text-md font-semibold">Profile Information</h2>
          <p className="text-sm text-muted-foreground">Update your profile information</p>
        </>}
        footer={
          <div className="flex justify-end gap-2 mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </div>
        }
      >
        <div className="space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {inputs.phoneNumber}
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
        </div>
      </AppCard>
    </div>
  );
}
