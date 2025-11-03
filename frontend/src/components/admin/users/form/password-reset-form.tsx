// External Libraries
import React, { useId } from "react";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { type FormInputs, useInput } from "@/hooks/use-input";

// Types
import type { TFormHandlerStore } from "@/stores";
import type { TUserResetPasswordData } from "@shared/types/user.type";
import type { IMessageResponse } from "@shared/interfaces/api/response.interface";
import type { THandlerComponentProps } from "@/@types/handler-types";
import type { TFieldConfigObject } from "@/@types/form/field-config.type";

// Components
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/layout-ui/app-card";

interface IPasswordResetFormProps extends THandlerComponentProps<TFormHandlerStore<TUserResetPasswordData, IMessageResponse, any>> {
}

const PasswordResetForm = React.memo(function PasswordResetForm({
    storeKey,
    store,
}: IPasswordResetFormProps) {
    // React 19: Essential IDs
    const componentId = useId();

    const isSubmitting = store?.((state) => state.isSubmitting) ?? false;
    const storeFields = store?.((state) => state.fields) ?? {};

    // React 19: Memoized fields for better performance
    const fields = React.useMemo(() => ({
        ...storeFields,
    } as TFieldConfigObject<TUserResetPasswordData>), [storeFields]);

    const inputs = useInput<TUserResetPasswordData>({
        fields,
        showRequiredAsterisk: true,
    }) as FormInputs<TUserResetPasswordData>;

    if (!store) {
        return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    return (
        <div data-component-id={componentId} className="space-y-6">
            <AppCard
                header={
                    <>
                        <h2 className="text-md font-semibold">Password Reset</h2>
                        <p className="text-sm text-muted-foreground">Change your account password</p>
                    </>
                }
                footer={
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Password Fields */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Password Information</h3>
                        <div className="grid grid-cols-1 gap-6 items-start">
                            {inputs.currentPassword}
                            {inputs.password}
                            {inputs.confirmPassword}
                        </div>
                    </div>
                </div>
            </AppCard>
        </div>
    );
});

export default PasswordResetForm;

