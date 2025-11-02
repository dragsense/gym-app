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
import { type TClientData } from "@shared/types/client.type";
import { type IClient, type TClientResponse } from "@shared/interfaces/client.interface";

// Store
import { type TSingleHandlerStore } from "@/stores";

// Components
import { ClientFormModal, type IClientFormModalExtraProps } from "@/components/admin";
import { CredentialModal } from "@/components/shared-ui/credential-modal";

// Services
import { createClient, updateClient } from "@/services/client.api";
import { strictDeepMerge } from "@/utils";
import { EUserGender } from "@shared/enums";
import { CreateClientDto, UpdateClientDto } from "@shared/dtos";

export type TClientExtraProps = {
    level: number;
}

interface IClientFormProps extends THandlerComponentProps<TSingleHandlerStore<IClient, TClientExtraProps>> {
}

export function ClientForm({
    storeKey,
    store,
}: IClientFormProps) {
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

    const INITIAL_VALUES: TClientData = {
        user: {
            email: "",
            isActive: true,
            firstName: "",
            lastName: "",
            gender: EUserGender.MALE,
            dateOfBirth: new Date(
                new Date().setFullYear(new Date().getFullYear() - 12)
            ).toISOString(),

        },
        fitnessLevel: '',
        goal: '',
        medicalConditions: '',
    };

    // React 19: Memoized initial values with deferred processing
    const initialValues = useMemo(() => {
        return strictDeepMerge<TClientData>(INITIAL_VALUES, response ?? {});
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
        return isEditing ? updateClient(response.id) : createClient;
    }, [isEditing, response?.id]);

    // React 19: Memoized DTO to prevent unnecessary re-renders
    const dto = useMemo(() => {
        return isEditing ? UpdateClientDto : CreateClientDto;
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
            <FormHandler<TClientData, TClientResponse, IClientFormModalExtraProps>
                mutationFn={mutationFn}
                FormComponent={ClientFormModal}
                storeKey={storeKey}
                initialValues={initialValues}
                dto={dto}
                validationMode={EVALIDATION_MODES.OnSubmit}
                isEditing={isEditing}
                onSuccess={(response: any) => {
                    startTransition(() => {
                        queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });

                        if (response && 'client' in response && response.client && 'user' in response.client) {
                            const user = response.client.user;
                            setCredentialModalContent({
                                open: true,
                                email: user.email,
                                password: user.password || ""
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
