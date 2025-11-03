// External Libraries
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useTransition } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type TUpdateProfileData } from "@shared/types/user.type";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";
import type { IProfile } from "@shared/interfaces/user.interface";

// Components
import { ProfileForm } from "@/components/admin";

// Services
import { fetchMyProfile, updateMyProfile } from "@/services/user.api";
import { strictDeepMerge } from "@/utils";
import { UpdateProfileDto } from "@shared/dtos";

export default function ProfileTab() {
    const [, startTransition] = useTransition();
    const queryClient = useQueryClient();
    const PROFILE_STORE_KEY = "account-profile";

    // Fetch profile data
    const { data: profile } = useQuery<IProfile>({
        queryKey: [PROFILE_STORE_KEY],
        queryFn: () => fetchMyProfile(),
        enabled: true,
    });

    const profileInitialValues = useMemo(() => {
        const INITIAL_PROFILE_VALUES: TUpdateProfileData = {
            phoneNumber: "",
            address: "",
            image: undefined,
            documents: []
        };
        return strictDeepMerge<TUpdateProfileData>(INITIAL_PROFILE_VALUES, profile ?? {});
    }, [profile]);

    const handleProfileSuccess = () => {
        startTransition(() => {
            queryClient.invalidateQueries({ queryKey: [PROFILE_STORE_KEY] });
        });
    };

    return (
        <FormHandler<TUpdateProfileData, IMessageResponse>
            mutationFn={updateMyProfile}
            FormComponent={ProfileForm}
            storeKey={PROFILE_STORE_KEY}
            initialValues={profileInitialValues}
            dto={UpdateProfileDto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            isEditing={true}
            onSuccess={handleProfileSuccess}
        />
    );
}

