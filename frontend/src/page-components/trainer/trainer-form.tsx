// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback, useId, useTransition, useDeferredValue } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { type TTrainerData } from "@shared/types/trainer.type";
import { type ITrainer, type TTrainerResponse } from "@shared/interfaces/trainer.interface";

// Store
import { type TSingleHandlerStore } from "@/stores";

// Components
import { TrainerFormModal, type ITrainerFormModalExtraProps } from "@/components/admin";
import { CredentialModal } from "@/components/shared-ui/credential-modal";

// Services
import { createTrainer, updateTrainer } from "@/services/trainer.api";
import { strictDeepMerge } from "@/utils";
import { EUserGender } from "@shared/enums";
import { CreateTrainerDto, UpdateTrainerDto } from "@shared/dtos";

export type TTrainerExtraProps = {
    level: number;
}

interface ITrainerFormProps extends THandlerComponentProps<TSingleHandlerStore<ITrainer, TTrainerExtraProps>> {
}

export function TrainerForm({
    storeKey,
    store,
}: ITrainerFormProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    const queryClient = useQueryClient();
    const [credentialModalContent, setCredentialModalContent] = useState({
        open: false,
        email: "",
        password: ""
    });

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

    const INITIAL_VALUES: TTrainerData = {
        user: {
            email: "",
            isActive: true,
            profile: {
                firstName: "",
                lastName: "",
                phoneNumber: "",
                dateOfBirth: new Date(
                    new Date().setFullYear(new Date().getFullYear() - 12)
                ).toISOString(),
                address: "",
                gender: EUserGender.MALE
            }
        },
        specialization: "",
        experience: 0,
        certification: "",
        hourlyRate: 0,
    };

    // React 19: Memoized initial values with deferred processing
    const initialValues = useMemo(() => {
        return strictDeepMerge<TTrainerData>(INITIAL_VALUES, response ?? {});
    }, [INITIAL_VALUES, response?.id]);

    const handleClose = useCallback(() => {
        startTransition(() => {
            reset();
            setAction('none');
            setCredentialModalContent({ open: false, email: "", password: "" });
        });
    }, [reset, setAction, startTransition]);

    const isEditing = !!response?.id;

    const mutationFn = useMemo(() => {
        return isEditing ? updateTrainer(response.id) : createTrainer;
    }, [isEditing, response?.id]);

    // React 19: Memoized DTO to prevent unnecessary re-renders
    const dto = useMemo(() => {
        return isEditing ? UpdateTrainerDto : CreateTrainerDto;
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
            <FormHandler<TTrainerData, TTrainerResponse, ITrainerFormModalExtraProps>
                mutationFn={mutationFn}
                FormComponent={TrainerFormModal}
                storeKey={storeKey}
                initialValues={initialValues}
                dto={dto}
                validationMode={EVALIDATION_MODES.OnSubmit}
                isEditing={isEditing}
                onSuccess={(response: any) => {
                    startTransition(() => {
                        queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });

                        if (response && 'trainer' in response && response.trainer) {
                            setCredentialModalContent({
                                open: true,
                                email: response.trainer.email,
                                password: response.trainer.password || ""
                            })
                        }
                    });
                }}
                formProps={{
                    open: action === 'createOrUpdate',
                    onClose: handleClose,
                }}
            />

            <CredentialModal
                open={credentialModalContent.open}
                onOpenChange={(state: boolean) => {
                    startTransition(() => {
                        if (!state) {
                            handleClose();
                        }
                    });
                }}
                email={credentialModalContent.email}
                password={credentialModalContent.password}
                closeModal={handleClose}
            />
        </div>
    );
}