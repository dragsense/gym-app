// External Libraries
import React, { useMemo, useId, useTransition, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TClientData, TUpdateClientData } from "@shared/types/client.type";
import type { TClientResponse } from "@shared/interfaces/client.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import type { TUserData, TProfileData } from "@shared/types";
import { addRenderItem } from "@/lib/fields/dto-to-feilds";
import type { TFieldConfigObject } from "@/@types/form/field-config.type";

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
  const { t } = useI18n();

  if (!store) {
    return `${buildSentence(t, 'form', 'store')} "${storeKey}" ${buildSentence(t, 'not', 'found')}. ${buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?`;
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
            {user.firstName as ReactNode}
            {user.lastName as ReactNode}
            {user.dateOfBirth as ReactNode}
            {user.gender as ReactNode}
          </div>


        </div>
      ),

    };

    return addRenderItem(storeFields, renderers) as TFieldConfigObject<TClientData | TUpdateClientData>;
  }, [storeFields]);

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
        {t('cancel')}
      </Button>
      <Button type="submit" disabled={false} data-component-id={componentId}>
        {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? t('update') : t('add')}
      </Button>
    </div>
  ), [componentId, isEditing, onClose]);

  const userInputs = inputs.user;


  return <>
    <ModalForm<TClientData, TClientResponse, IClientFormModalExtraProps>
      title={buildSentence(t, isEditing ? 'edit' : 'add', 'client')}
      description={buildSentence(t, isEditing ? 'edit' : 'add', 'a', 'new', 'client')}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{buildSentence(t, 'basic', 'info')}</h3>
          {userInputs as ReactNode}
        </div>
        {/* Trainer Details */}
        <div>
          <h3 className="text-sm font-semibold  mb-3">{buildSentence(t, 'client', 'details')}</h3>
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

