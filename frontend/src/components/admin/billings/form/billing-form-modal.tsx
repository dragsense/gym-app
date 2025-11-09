// External Libraries
import React, { type ReactNode, useMemo, useId, useTransition } from "react";
import { Loader2 } from "lucide-react";
// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";
import { useUserSettings } from "@/hooks/use-user-settings";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TBillingData } from "@shared/types/billing.type";
import type { IBillingResponse } from "@shared/interfaces/billing.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import type { THandlerComponentProps } from "@/@types/handler-types";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { useSearchableUsers } from "@/hooks/use-searchable";
import type { TCustomInputWrapper, TFieldConfigObject } from "@/@types/form/field-config.type";
import type { ReminderDto } from "@shared/dtos/reminder-dtos";
import type { UserDto } from "@shared/dtos";
import { EUserLevels } from "@shared/enums";

export interface IBillingFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

interface IBillingFormModalProps extends THandlerComponentProps<TFormHandlerStore<TBillingData, IBillingResponse, IBillingFormModalExtraProps>> {
}

const BillingFormModal = React.memo(function BillingFormModal({
  storeKey,
  store,
}: IBillingFormModalProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  const { t } = useI18n();

  const { settings } = useUserSettings();

  if (!store) {
    return `${buildSentence(t, 'form', 'store')} "${storeKey}" ${buildSentence(t, 'not', 'found')}. ${buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?`;
  }

  const isEditing = store((state) => state.isEditing)

  const open = store((state) => state.extra.open)
  const onClose = store((state) => state.extra.onClose)

  // Get form values for tax calculation
  const formValues = store((state) => state.values);
  const amount = formValues?.amount || 0;
  const taxRate = settings?.billing?.taxRate || 0;
  const taxAmount = (amount * taxRate) / 100;
  const totalAmount = amount + taxAmount;

  // React 19: Memoized fields for better performance
  const storeFields = store((state) => state.fields)

  const RecipientUserSelect = React.memo(
    (props: TCustomInputWrapper) => {
      return <SearchableInputWrapper<UserDto>
        {...props}
        modal={true}
        useSearchable={() => useSearchableUsers({})}
        getLabel={(item) => {
          if (!item) return buildSentence(t, 'select', 'recipient')
          return `${item.firstName} ${item.lastName} (${item.email})`
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, firstName: item.firstName, lastName: item.lastName, email: item.email } }}
        shouldFilter={false}
      />
    }
  );


  // React 19: Memoized fields for better performance
  const fields = useMemo(() => ({
    ...storeFields,
    recipientUser: {
      ...storeFields.recipientUser,
      type: 'custom' as const,
      Component: RecipientUserSelect
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
  } as TFieldConfigObject<TBillingData>), [storeFields]);

  const inputs = useInput<TBillingData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TBillingData>;

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

  return <>
    <ModalForm<TBillingData, IBillingResponse, IBillingFormModalExtraProps>
      title={buildSentence(t, isEditing ? 'edit' : 'add', 'billing')}
      description={buildSentence(t, isEditing ? 'edit' : 'add', 'billing')}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Billing Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{buildSentence(t, 'billing', 'information')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.title}
            {inputs.type}
          </div>
          <div className="mt-6">
            {inputs.description}
          </div>
        </div>

        {/* Amount and Due Date */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{buildSentence(t, 'payment', 'details')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.amount}
            {inputs.dueDate}
          </div>
          {taxRate > 0 && amount > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('subtotal')}:</span>
                <span className="font-medium">{formatCurrency(amount, undefined, undefined, 2, 2, settings)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('tax')} ({taxRate}%):</span>
                <span className="font-medium">{formatCurrency(taxAmount, undefined, undefined, 2, 2, settings)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t">
                <span>{t('total')}:</span>
                <span>{formatCurrency(totalAmount, undefined, undefined, 2, 2, settings)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Participants */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{t('participants')}</h3>
          <div className="grid grid-cols-2 gap-6 items-start">
            {inputs.recipientUser as ReactNode}
          </div>
        </div>

        {/* Recurring Options */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{t('date')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.recurrence}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">{t('details')}</h3>
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

export default BillingFormModal;
