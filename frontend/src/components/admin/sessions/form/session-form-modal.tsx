// External Libraries
import React, { type ReactNode, useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TSessionData } from "@shared/types/session.type";
import type { ISessionResponse } from "@shared/interfaces/session.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import type { TCustomInputWrapper, TFieldConfigObject } from "@/@types/form/field-config.type";
import type { ClientDto, TrainerDto } from "@shared/dtos";
import type { ReminderDto } from "@shared/dtos/reminder-dtos";
import { useSearchableClients, useSearchableTrainers } from "@/hooks/use-searchable";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useUserSettings } from "@/hooks/use-user-settings";
import { EUserLevels } from "@shared/enums";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

export interface ISessionFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface ISessionFormModalProps extends THandlerComponentProps<TFormHandlerStore<TSessionData, ISessionResponse, ISessionFormModalExtraProps>> {
}

const SessionFormModal = React.memo(function SessionFormModal({
  storeKey,
  store,
}: ISessionFormModalProps) {

  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  const { user } = useAuthUser();
  const { settings } = useUserSettings();
  const { t } = useI18n();
  
  // Get form values for validation
  const formValues = store((state) => state.values);
  const limits = settings?.limits;

  if (!store) {
    return `${buildSentence(t, 'form', 'store')} "${storeKey}" ${buildSentence(t, 'not', 'found')}. ${buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?`;
  }

  const isSubmitting = store((state) => state.isSubmitting)
  const isEditing = store((state) => state.isEditing)

  const open = store((state) => state.extra.open)
  const onClose = store((state) => state.extra.onClose)

  // React 19: Memoized fields for better performance
  const storeFields = store((state) => state.fields)

  const TrainerSelect = React.memo(
    (props: TCustomInputWrapper) => {
      return <SearchableInputWrapper<TrainerDto>
        {...props}
        modal={true}
        useSearchable={() => useSearchableTrainers({})}
        getLabel={(item) => {
          if (!item?.user?.firstName) return t('trainer')
          return `${item.user?.firstName} ${item.user?.lastName} (${item.user?.email})`
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, user: item.user } }}
        shouldFilter={false}
      />
    }
  );

  const ClientsSelect = React.memo(
    (props: TCustomInputWrapper) => (
      <SearchableInputWrapper<ClientDto>
        {...props}
        modal={true}
        useSearchable={() => useSearchableClients({})}
        getLabel={(item) => {
          if (!item?.user?.firstName) return t('clients')

          return `${item.user?.firstName} ${item.user?.lastName} (${item.user?.email})`
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, user: item.user } }}
        shouldFilter={false}
        multiple={true}
      />
    )
  );

  // React 19: Memoized fields for better performance
  const fields = useMemo(() => ({
    ...storeFields,
    trainer: {
      ...storeFields.trainer,
      type: 'custom' as const,
      Component: TrainerSelect,
      visible: () => user?.level !== EUserLevels.TRAINER
    },
    clients: {
      ...storeFields.clients,
      type: 'custom' as const,
      Component: ClientsSelect
    },

    reminderConfig: {
      ...storeFields.reminderConfig,
      visible: (ctx: { values: Record<string, any> }) => ctx.values.enableReminder,
      renderItem: (items: ReminderDto) => {
        return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.sendBefore as ReactNode}
          {items.reminderTypes as ReactNode}
        </div>
      }
    },
  } as TFieldConfigObject<TSessionData>), [storeFields]);

  const inputs = useInput<TSessionData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TSessionData>;

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
      <Button type="submit" disabled={isSubmitting} data-component-id={componentId}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? t('update') : t('add')}
      </Button>
    </div>
  ), [componentId, isEditing, onClose, isSubmitting, t]);

  return <>
    <ModalForm<TSessionData, ISessionResponse, ISessionFormModalExtraProps>
      title={buildSentence(t, isEditing ? 'edit' : 'add', 'session')}
      description={buildSentence(t, isEditing ? 'edit' : 'add', 'session')}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Session Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{buildSentence(t, 'session', 'information')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.title}
            {inputs.type}
          </div>
          <div className="mt-6">
            {inputs.description}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{t('date')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.startDateTime}
            {inputs.duration}
          </div>
        </div>

        {/* Participants */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{t('participants')}</h3>
          <div className="grid grid-cols-2 gap-6 items-start">
            {inputs.trainer as ReactNode}
            {inputs.clients as ReactNode}
          </div>
          {limits?.maxClientsPerSession && formValues?.clients && (
            <Alert className={`mt-4 ${formValues.clients.length > limits.maxClientsPerSession ? 'border-red-500' : 'border-blue-500'}`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formValues.clients.length > limits.maxClientsPerSession ? (
                  <span className="text-red-600">
                    {buildSentence(t, 'maximum', limits.maxClientsPerSession.toString(), 'clients', 'allowed', 'per', 'session')} {buildSentence(t, 'you', 'selected', formValues.clients.length.toString(), 'clients')}
                  </span>
                ) : (
                  <span className="text-blue-600">
                    {buildSentence(t, formValues.clients.length.toString(), 'of', limits.maxClientsPerSession.toString(), 'clients', 'selected')}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{t('details')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.location}
            {inputs.price}
          </div>
          <div className="mt-6">
            {inputs.notes}
          </div>
        </div>

        {/* Reminders */}
        <div>

          <div className="space-y-4">

            {inputs.enableReminder}
            {inputs.reminderConfig as ReactNode}
          </div>

        </div>
      </div>
    </ModalForm >
  </>
});

export default SessionFormModal;