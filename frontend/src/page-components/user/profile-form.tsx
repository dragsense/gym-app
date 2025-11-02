
// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback, useId, useTransition, useDeferredValue } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { type TUpdateProfileData } from "@shared/types/user.type";
import { type IUser } from "@shared/interfaces/user.interface";
import { type ITrainer } from "@shared/interfaces/trainer.interface";
import { type IClient } from "@shared/interfaces/client.interface";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";


// Store
import { type TSingleHandlerStore } from "@/stores";

// Components
import { ProfileFormModal, type IProfileFormModalExtraProps } from "@/components/admin";

// Services
import { updateProfile } from "@/services/user.api";
import { strictDeepMerge } from "@/utils";
import { EUserGender } from "@shared/enums";
import { UpdateProfileDto } from "@shared/dtos";




interface IProfileFormProps extends THandlerComponentProps<TSingleHandlerStore<IUser | ITrainer | IClient, any>> {
}

export default function ProfileForm({
    storeKey,
    store,
}: IProfileFormProps) {
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

    const userProfile = response as IUser;
    const trainerProfile = response as ITrainer;
    const clientProfile = response as IClient;
    const profile = userProfile?.profile ?? trainerProfile?.user?.profile ?? clientProfile?.user?.profile;


    const INITIAL_VALUES: TUpdateProfileData = {
        phoneNumber: "",
        address: "",
        image: undefined,
        documents: undefined
    };

    const initialValues = useMemo(() => {
        return strictDeepMerge<TUpdateProfileData>(INITIAL_VALUES, profile ?? {});
    }, [INITIAL_VALUES, profile?.id]);





    const handleClose = useCallback(() => {
        startTransition(() => {
            reset();
            setAction('none');
        });
    }, [reset, setAction, startTransition]);



    const isEditing = true;
    const mutationFn = updateProfile;
    const dto = UpdateProfileDto;



    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!profile) {
        return <div>No Profile found</div>;
    }


    return (
        <div data-component-id={componentId}>
            <FormHandler<TUpdateProfileData, IMessageResponse, IProfileFormModalExtraProps>
                mutationFn={mutationFn}
                FormComponent={ProfileFormModal}
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
                    open: action === 'updateProfile',
                    onClose: handleClose,
                }}
            />
        </div>
    )

}

