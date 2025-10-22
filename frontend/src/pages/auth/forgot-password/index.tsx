// External Libraries
import { toast } from "sonner";
import { useTransition, useId } from "react";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";
import { type TForgotPasswordData } from "@shared/types/auth.type";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { ForgotPasswordForm } from "@/components/auth";

// Services
import { forgotPassword } from "@/services/auth.api";
import { ForgotPasswordDto } from "@shared/dtos";


export default function ForgotPasswordPage() {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  
  const FORGOT_PASSWORD_INITIAL_VALUES: TForgotPasswordData = {
    email: ""
  };

  return (
    <FormHandler<TForgotPasswordData, IMessageResponse>
      mutationFn={forgotPassword}
      FormComponent={ForgotPasswordForm}
      initialValues={FORGOT_PASSWORD_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      dto={ForgotPasswordDto}
      onSuccess={() => {
        startTransition(() => {
          toast.success('Password reset instructions sent to your email');
        });
      }}
      onError={(error) => toast.error('Failed to send reset instructions: ' + error?.message)}
      storeKey="forgot-password"
    />
  );
}
