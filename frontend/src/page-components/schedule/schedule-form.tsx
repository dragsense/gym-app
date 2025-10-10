// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { type ISchedule } from "@shared/interfaces/schedule.interface";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";

// Store
import { type TSingleHandlerStore } from "@/stores";

// Components
import { ScheduleFormModal } from "@/components/admin";

export interface IScheduleFormModalExtraProps {
  open: boolean;
  onClose: () => void;
}

// Services
import { createSchedule, updateSchedule } from "@/services/schedule.api";
import { strictDeepMerge } from "@/utils";
import { CreateScheduleDto, UpdateScheduleDto } from "@shared/dtos";
import { EScheduleFrequency, EIntervalUnit } from "@shared/enums";
import type { TScheduleData } from '@shared/types';

export type TScheduleExtraProps = {};

interface IScheduleFormProps extends THandlerComponentProps<TSingleHandlerStore<ISchedule, TScheduleExtraProps>> {}

export default function ScheduleForm({
    storeKey,
    store,
}: IScheduleFormProps) {

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

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const INITIAL_VALUES: TScheduleData = {
        title: "",
        action: "",
        frequency: EScheduleFrequency.ONCE,
        startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        intervalUnit: EIntervalUnit.MINUTES,
        retryOnFailure: false,
        maxRetries: 3,
        retryDelayMinutes: 5,
    };

    const initialValues = strictDeepMerge<TScheduleData>(INITIAL_VALUES, response ?? {});

    const handleClose = () => {
        reset();
        setAction('none');
    };

    const isEditing = !!response?.id;
    const mutationFn = isEditing ? updateSchedule(response.id) : createSchedule;
    const dto = isEditing ? UpdateScheduleDto : CreateScheduleDto;

    return (
        <FormHandler<TScheduleData, IMessageResponse, IScheduleFormModalExtraProps>
            mutationFn={mutationFn}
            FormComponent={ScheduleFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            dto={dto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            isEditing={isEditing}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
                handleClose();
            }}
            formProps={{
                open: action === 'createOrUpdate',
                onClose: handleClose,
            }}
        />
    );
}

