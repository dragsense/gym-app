// React
import React, { useState, useId, useMemo, useTransition } from 'react';

// Types
import { type TAuthResetPasswordData } from '@shared/types/auth.type';
import { type IMessageResponse } from '@shared/interfaces/api/response.interface';
import { type TFormHandlerStore } from '@/stores';
import { type THandlerComponentProps } from '@/@types/handler-types';

// External Libraries
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/form-ui/form';

// Hooks
import { type FormInputs, useInput } from '@/hooks/use-input';

// Stores
import { AppCard } from '../layout-ui/app-card';

interface IResetPasswordFormProps extends THandlerComponentProps<TFormHandlerStore<TAuthResetPasswordData, IMessageResponse, any>> {
}

const ResetPasswordForm = React.memo(function ResetPasswordForm({
  storeKey,
  store,
}: IResetPasswordFormProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isSubmitting = store(state => state.isSubmitting);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const originalFields = store(state => state.fields);
  
  // React 19: Memoized fields for better performance
  const fields = useMemo(() => ({
    ...originalFields,
    password: {
      ...originalFields.password,
      type: showPassword ? 'text' : 'password',
      endAdornment: (
        <button
          type="button"
          onClick={() => startTransition(() => setShowPassword(!showPassword))}
          className="text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )
    },
    confirmPassword: {
      ...originalFields.confirmPassword,
      type: showConfirmPassword ? 'text' : 'password',
      endAdornment: (
        <button
          type="button"
          onClick={() => startTransition(() => setShowConfirmPassword(!showConfirmPassword))}
          className="text-muted-foreground hover:text-foreground"
        >
          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )
    }
  }), [originalFields, showPassword, showConfirmPassword]);

  const inputs = useInput<TAuthResetPasswordData>({
    fields: fields as any,
    showRequiredAsterisk: true
  }) as FormInputs<TAuthResetPasswordData>;
 
  return (
    <Form<TAuthResetPasswordData, IMessageResponse>
      formStore={store}
    >
      <AppCard
        header={
          <>
            <h2 className="text-md font-semibold">Reset Password</h2>
            <p className="text-sm text-muted-foreground">Enter your new password to reset your account</p>
          </>
        }
        footer={
          <div className="flex flex-col gap-4 w-full">
            <Button type="submit" className="w-full" disabled={isSubmitting} data-component-id={componentId}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4 w-full">
          {inputs.password}
          {inputs.confirmPassword}
        </div>
      </AppCard>

    </Form>
  );
});

export default ResetPasswordForm;