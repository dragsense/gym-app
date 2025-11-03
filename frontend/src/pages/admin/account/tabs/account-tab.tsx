// External Libraries
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useTransition } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type TUpdateUserData } from "@shared/types/user.type";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";
import type { IAuthUser } from "@shared/interfaces/auth.interface";

// Components
import { UserForm } from "@/components/admin";

// Services
import { updateMe } from "@/services/user.api";
import { me } from "@/services/auth.api";
import { strictDeepMerge } from "@/utils";
import { UpdateUserDto } from "@shared/dtos";

export default function AccountTab() {
    const [, startTransition] = useTransition();
    const queryClient = useQueryClient();
    const USER_STORE_KEY = "account-user";

    // Fetch user data
    const { data: user } = useQuery({
        queryKey: ["me"],
        queryFn: () => me() as Promise<IAuthUser>,
        enabled: true,
    });

    const userInitialValues = useMemo(() => {
        const INITIAL_USER_VALUES: TUpdateUserData = {
            email: "",
            firstName: "",
            lastName: "",
            dateOfBirth: undefined,
            gender: undefined,
        };
        return strictDeepMerge<TUpdateUserData>(INITIAL_USER_VALUES, user ?? {});
    }, [user]);

    const handleUserSuccess = () => {
        startTransition(() => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        });
    };

    return (
        <FormHandler<TUpdateUserData, IMessageResponse>
            mutationFn={updateMe}
            FormComponent={UserForm}
            storeKey={USER_STORE_KEY}
            initialValues={userInitialValues}
            dto={UpdateUserDto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            isEditing={true}
            onSuccess={handleUserSuccess}
        />
    );
}

