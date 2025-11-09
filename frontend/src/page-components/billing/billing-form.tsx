// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback, useId, useTransition } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { type TBillingData } from "@shared/types/billing.type";
import { type IBilling, type IBillingResponse } from "@shared/interfaces/billing.interface";

// Store 
import { type TSingleHandlerStore } from "@/stores";

// Components
import { BillingFormModal } from "@/components/admin";

// Services
import { createBilling, updateBilling } from "@/services/billing.api";
import { strictDeepMerge } from "@/utils";
import { EBillingType } from "@shared/enums/billing.enum";
import { CreateBillingDto, UpdateBillingDto } from "@shared/dtos/billing-dtos";
import type { IBillingFormModalExtraProps } from '@/components/admin/billings/form/billing-form-modal';
import { EReminderType, EScheduleFrequency } from '@shared/enums';
import type { UserDto } from '@shared/dtos';
import type { ReminderDto } from '@shared/dtos/reminder-dtos';
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";

export type TBillingExtraProps = {
    // Add any extra props if needed
}

interface IBillingFormProps extends THandlerComponentProps<TSingleHandlerStore<IBilling, TBillingExtraProps>> {
}

export default function BillingForm({
    storeKey,
    store,
}: IBillingFormProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    const queryClient = useQueryClient();
    const { t } = useI18n();

    if (!store) {
        return <div>{buildSentence(t, 'single', 'store')} "{storeKey}" {buildSentence(t, 'not', 'found')}. {buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?</div>;
    }

    const { action, response, isLoading, setAction, reset } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        setAction: state.setAction,
        reset: state.reset
    })));

    const INITIAL_VALUES: TBillingData = {
        title: "",
        description: "",
        amount: 0,
        issueDate: new Date().toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        recipientUser: null,
        type: EBillingType.SESSION,
        recurrence: EScheduleFrequency.ONCE,
        notes: "",
        reminderConfig: { reminderTypes: [EReminderType.EMAIL] } as ReminderDto,
        enableReminder: false
    };

    // React 19: Memoized initial values with deferred processing
    const initialValues = useMemo(() => {
        return strictDeepMerge<TBillingData>(INITIAL_VALUES, response ?? {});
    }, [INITIAL_VALUES, response?.id]);

    const handleClose = useCallback(() => {
        startTransition(() => {
            reset();
            setAction('none');
        });
    }, [reset, setAction, startTransition]);

    const isEditing = !!response?.id;

    const mutationFn = useMemo(() => {
        return isEditing ? updateBilling(response.id) : createBilling;
    }, [isEditing, response?.id]);

    // React 19: Memoized DTO to prevent unnecessary re-renders
    const dto = useMemo(() => {
        return isEditing ? UpdateBillingDto : CreateBillingDto;
    }, [isEditing]);

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div data-component-id={componentId}>
            <FormHandler<TBillingData, IBillingResponse, IBillingFormModalExtraProps>
                mutationFn={mutationFn}
                FormComponent={BillingFormModal}
                storeKey={storeKey}
                initialValues={initialValues}
                dto={dto}
                validationMode={EVALIDATION_MODES.OnSubmit}
                isEditing={isEditing}
                onSuccess={() => {
                    startTransition(() => {
                        queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
                        handleClose();
                    });
                }}
                formProps={{
                    open: action === 'createOrUpdate',
                    onClose: handleClose,
                }}
            />
        </div>
    );
}
