// src/pages/auth/VerifyOtpPage.tsx
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// Types
import type { TVerifyOtpData } from "@shared/types";

import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { VerifyOtpForm } from "@/components/auth";

// Services
import { resendOtp, verifyOtp } from "@/services/auth.api";
import { ADMIN_ROUTES } from "@/config/routes.config";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";
import { VerifyOtpDto } from "@shared/dtos";



export default function VerifyOtpPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();


    const token = searchParams.get("token");

    const OTP_INITIAL_VALUES: TVerifyOtpData = {
        token: token || "",
        code: "",
        rememberDevice: true,
        deviceId: localStorage.getItem("pb_device_id") || undefined

    };

    return (
        <FormHandler<TVerifyOtpData, IMessageResponse, { resendOtp: () => Promise<IMessageResponse> }>
            mutationFn={verifyOtp}
            FormComponent={VerifyOtpForm}
            initialValues={OTP_INITIAL_VALUES}
            validationMode={EVALIDATION_MODES.OnChange}
            dto={VerifyOtpDto}
            onSuccess={() => {
                toast.success('Login successful')
                queryClient.invalidateQueries({ queryKey: ["me"] });
                navigate(ADMIN_ROUTES.USERS);
            }}
            onError={(error) => toast.error("OTP verification failed: " + error?.message)}
            storeKey="verify-otp"
            formProps={{
                resendOtp: () => resendOtp({ token: token || "" }),
            }}
        />
    );
}
