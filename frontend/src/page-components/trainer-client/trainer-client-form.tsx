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
import { type TTrainerClientData } from "@shared/types/trainer-client.type";
import { type ITrainerClient } from "@shared/interfaces/trainer-client.interface";

// Store
import { type TSingleHandlerStore } from "@/stores";

// Components
import { TrainerClientFormModal, type ITrainerClientFormModalExtraProps } from "@/components/admin";

// Services
import { createTrainerClient, updateTrainerClient } from "@/services/trainer-client.api";
import { strictDeepMerge } from "@/utils";
import { CreateTrainerClientDto, UpdateTrainerClientDto } from "@shared/dtos";
import { ETrainerClientStatus } from "@shared/enums/trainer-client.enum";

export type TTrainerClientExtraProps = {
  level: number;
}

interface ITrainerClientFormProps extends THandlerComponentProps<TSingleHandlerStore<ITrainerClient, TTrainerClientExtraProps>> {
}

export default function TrainerClientForm({
    storeKey,
    store,
}: ITrainerClientFormProps) {
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

    const INITIAL_VALUES: TTrainerClientData = {
        trainer: {} as any, // Will be set by the form
        client: {} as any, // Will be set by the form
        status: ETrainerClientStatus.ACTIVE,
        notes: ""
    };

    // React 19: Memoized initial values with deferred processing
    const initialValues = useMemo(() => {
        return strictDeepMerge<TTrainerClientData>(INITIAL_VALUES, response ?? {});
    }, [INITIAL_VALUES, response?.id]); 

    const handleClose = useCallback(() => {
        startTransition(() => {
            reset();
            setAction('none');
        });
    }, [reset, setAction, startTransition]);

    const isEditing = !!response?.id;

    const mutationFn = useMemo(() => {
        return isEditing ? updateTrainerClient(response.id) : createTrainerClient;
    }, [isEditing, response?.id]);
    
    // React 19: Memoized DTO to prevent unnecessary re-renders
    const dto = useMemo(() => {
        return isEditing ? UpdateTrainerClientDto : CreateTrainerClientDto;
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
            <FormHandler<TTrainerClientData, TTrainerClientData, ITrainerClientFormModalExtraProps>
                mutationFn={mutationFn}
                FormComponent={TrainerClientFormModal}
                storeKey={storeKey}
                initialValues={initialValues}
                dto={dto}
                validationMode={EVALIDATION_MODES.OnSubmit}
                isEditing={isEditing}
                onSuccess={() => {
                    startTransition(() => {
                        queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
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
