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
import { type IUserAvailability } from "@shared/interfaces/user-availability.interface";

// Store
import { type TSingleHandlerStore } from "@/stores";

// Components

// Services
import { createUserAvailability, updateUserAvailability } from "@/services/user-availability.api";
import { strictDeepMerge } from "@/utils";
import { CreateUserAvailabilityDto, UpdateUserAvailabilityDto } from "@shared/dtos/user-availability-dtos";
import type { TUserAvailabilityData } from '@shared/types';
import { UserAvailabilityFormModal } from '@/components/admin';

export type TUserAvailabilityExtraProps = {
}

interface IUserAvailabilityFormProps extends THandlerComponentProps<TSingleHandlerStore<IUserAvailability, TUserAvailabilityExtraProps>> {
}

export default function UserAvailabilityForm({
    storeKey,
    store,
}: IUserAvailabilityFormProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    const queryClient = useQueryClient();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, setAction, reset } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        setAction: state.setAction,
        reset: state.reset
    })));

    const INITIAL_VALUES = {
        weeklySchedule: {
            monday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            tuesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            wednesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            thursday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            friday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            saturday: { enabled: false, timeSlots: [] },
            sunday: { enabled: false, timeSlots: [] },
        },
        unavailablePeriods: [],
    };

    // React 19: Memoized initial values with deferred processing
    const initialValues = useMemo(() => {
        return strictDeepMerge<TUserAvailabilityData>(INITIAL_VALUES, response ?? {});
    }, [INITIAL_VALUES, response?.id]);

    const handleClose = useCallback(() => {
        startTransition(() => {
            reset();
            setAction('none');
        });
    }, [reset, setAction, startTransition]);

    const isEditing = !!response?.id;

    const mutationFn = useMemo(() => {
        return isEditing ? updateUserAvailability(response.id) : createUserAvailability;
    }, [isEditing, response?.id]);

    // React 19: Memoized DTO to prevent unnecessary re-renders
    const dto = useMemo(() => {
        return isEditing ? UpdateUserAvailabilityDto : CreateUserAvailabilityDto;
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
            <FormHandler<any, any, any>
                mutationFn={mutationFn}
                FormComponent={UserAvailabilityFormModal}
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