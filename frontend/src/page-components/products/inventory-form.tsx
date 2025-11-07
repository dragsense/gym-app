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
import { type TInventoryData } from "@shared/types/products/inventory.type";
import { type ISession, type ISessionResponse } from "@shared/interfaces/session.interface";

// Store
import { type TSingleHandlerStore } from "@/stores";

// Components
import { InventoryFormModal } from "@/components/admin";

// Services
import { createInventory, updateInventory } from "@/services/products/inventory.api";
import { strictDeepMerge } from "@/utils";

import type { IInventory } from '@shared/interfaces/products/inventory.interface';
import type { IInventoryResponse } from '@shared/interfaces/products/inventory.interface';
import { CreateInventoryDto, UpdateInventoryDto } from '@shared/dtos';

export type TInventoryExtraProps = {
    // Add any extra props if needed
}

interface IInventoryFormProps extends THandlerComponentProps<TSingleHandlerStore<IInventory, TInventoryExtraProps>> {
}

export default function InventoryForm({
    storeKey,
    store,
}: IInventoryFormProps) {
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

    const INITIAL_VALUES: TInventoryData = {
        name: "",
        description: "",
        unit: "",
        quantity: 0
    };

    // React 19: Memoized initial values with deferred processing
    const initialValues = useMemo(() => {
        return strictDeepMerge<TInventoryData>(INITIAL_VALUES, response ?? {});
    }, [INITIAL_VALUES, response?.id]);



    const handleClose = useCallback(() => {
        startTransition(() => {
            reset();
            setAction('none');
        });
    }, [reset, setAction, startTransition]);

    const isEditing = !!response?.id;

    const mutationFn = useMemo(() => {
        return isEditing ? updateInventory(response.id) : createInventory;
    }, [isEditing, response?.id]);

    // React 19: Memoized DTO to prevent unnecessary re-renders
    const dto = useMemo(() => {
        return isEditing ? UpdateInventoryDto : CreateInventoryDto;
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
            <FormHandler<TInventoryData, IInventoryResponse>
                mutationFn={mutationFn}
                FormComponent={InventoryFormModal}
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
