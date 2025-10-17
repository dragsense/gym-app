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
import { type TSessionData } from "@shared/types/session.type";
import { type ISession, type ISessionResponse } from "@shared/interfaces/session.interface";

// Store
import { type TSingleHandlerStore } from "@/stores";

// Components
import { SessionFormModal } from "@/components/admin";

// Services
import { createSession, updateSession } from "@/services/session.api";
import { strictDeepMerge } from "@/utils";
import { ESessionType } from "@shared/enums/session.enum";
import { CreateSessionDto, UpdateSessionDto } from "@shared/dtos/session-dtos";
import type { TrainerDto } from '@shared/dtos/trainer-dtos';
import type { ClientDto } from '@shared/dtos/client-dtos';
import type { ISessionFormModalExtraProps } from '@/components/admin/sessions/form/session-form-modal';

export type TSessionExtraProps = {
  // Add any extra props if needed
}

interface ISessionFormProps extends THandlerComponentProps<TSingleHandlerStore<ISession, TSessionExtraProps>> {
}

export default function SessionForm({
    storeKey,
    store,
}: ISessionFormProps) {
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

    const INITIAL_VALUES: TSessionData = {
        title: "",
        description: "",
        startDateTime: "",
        endDateTime: "",
        trainer: {} as TrainerDto,
        clients: [] as ClientDto[],
        type: ESessionType.PERSONAL,
        location: "",
        price: 0,
        notes: "",
    };

    // React 19: Memoized initial values with deferred processing
    const initialValues = useMemo(() => {
        return strictDeepMerge<TSessionData>(INITIAL_VALUES, response ?? {});
    }, [INITIAL_VALUES, response?.id]);

    const handleClose = useCallback(() => {
        startTransition(() => {
            reset();
            setAction('none');
        });
    }, [reset, setAction, startTransition]);

    const isEditing = !!response?.id;

    const mutationFn = useMemo(() => {
        return isEditing ? updateSession(response.id) : createSession;
    }, [isEditing, response?.id]);

    // React 19: Memoized DTO to prevent unnecessary re-renders
    const dto = useMemo(() => {
        return isEditing ? UpdateSessionDto : CreateSessionDto;
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
            <FormHandler<TSessionData, ISessionResponse, ISessionFormModalExtraProps>
                mutationFn={mutationFn}
                FormComponent={SessionFormModal}
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
