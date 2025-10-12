// External Libraries
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTransition, useId } from "react";

// Types
import { type TSignupData } from "@shared/types/auth.type";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { SignupForm } from "@/components/auth";

// Services
import { signup } from "@/services/auth.api";
import { SignupDto } from "@shared/dtos";

// Config
import { PUBLIC_ROUTES } from "@/config/routes.config";


export default function SignupPage() {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  
  const navigate = useNavigate();

  const SIGNUP_INITIAL_VALUES: TSignupData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  };

  return (
    <FormHandler<TSignupData, IMessageResponse>
      mutationFn={signup}
      FormComponent={SignupForm}
      initialValues={SIGNUP_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      dto={SignupDto}
      onSuccess={() => {
        startTransition(() => {
          toast.success('Signup successful');
          navigate(PUBLIC_ROUTES.LOGIN);
        });
      }}
      onError={(error) => toast.error('Signup failed: ' + error?.message)}
      storeKey="signup"
    />
  );
}
