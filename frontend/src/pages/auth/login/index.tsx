// External Libraries
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTransition, useId } from "react";

// Types
import { type TLoginData } from "@shared/types/auth.type";
import { type ILoginResponse } from "@shared/interfaces/auth.interface";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { LoginForm } from "@/components/auth";

// Services
import { login } from "@/services/auth.api";
import { LoginDto } from "@shared/dtos";
import { ADMIN_ROUTES } from "@/config/routes.config";
import { useNavigate } from "react-router-dom";
import { buildRoutePath } from "@/lib/utils";
import { PUBLIC_ROUTES } from "@/config/routes.config";


export default function LoginPage() {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const LOGIN_INITIAL_VALUES: TLoginData = {
    email: "",
    password: "",
  };

  return (
    <FormHandler<TLoginData, ILoginResponse>
      mutationFn={login}
      FormComponent={LoginForm}
      initialValues={LOGIN_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      dto={LoginDto}
      onSuccess={(res: unknown) => {
        startTransition(() => {
          const result: ILoginResponse = res as ILoginResponse;
          if (result.requiredOtp)
            navigate(buildRoutePath(PUBLIC_ROUTES.VERIFY_OTP, undefined, { token: result.token || '' }));
          else {
            toast.success('Login successful')
            queryClient.invalidateQueries({ queryKey: ["me"] });
            navigate(ADMIN_ROUTES.USERS);
          }
        });
      }}
      onError={(error) => toast.error('Login failed: ' + error?.message)}
      storeKey="login"
    />
  );
}
