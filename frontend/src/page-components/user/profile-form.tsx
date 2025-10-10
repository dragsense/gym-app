
// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type THandlerComponentProps } from "@/@types/handler-types";
import { type TUpdateProfileData } from "@shared/types/user.type";
import { type IUser } from "@shared/interfaces/user.interface";
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



interface IProfileFormProps extends THandlerComponentProps<TSingleHandlerStore<IUser, any>> {
}

export default function ProfileForm({
    storeKey,
    store,
}: IProfileFormProps) {

    const queryClient = useQueryClient();


    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }


    const { action, response, isLoading, setAction, reset, extra } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        extra: state.extra,
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

    if(!response) {
        return <div>No response found</div>;
    }


    const INITIAL_VALUES: TUpdateProfileData = {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        dateOfBirth: new Date(
            new Date().setFullYear(new Date().getFullYear() - 12)
        ).toISOString(),
        address: "",
        gender: EUserGender.MALE,
        image: undefined,
        documents: undefined,
        skills: []
    };

    const initialValues = strictDeepMerge<TUpdateProfileData>(INITIAL_VALUES, response?.profile ?? {});

    const handleClose = () => {
        reset();
        setAction('none');
    };



    const isEditing = true;
    const mutationFn = updateProfile;
    const dto = UpdateProfileDto;

    return <>
        <FormHandler<TUpdateProfileData, IMessageResponse, IProfileFormModalExtraProps>
            mutationFn={mutationFn}
            FormComponent={ProfileFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            dto={dto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            isEditing={isEditing}
            onSuccess={(response) => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
                handleClose();
            }}
            formProps={{
                open: action === 'updateProfile',
                onClose: handleClose,
            }}
        />
    </>

}

