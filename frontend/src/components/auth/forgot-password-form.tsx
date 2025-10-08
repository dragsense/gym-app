// React
import React from 'react';

// Types
import type { TForgotPasswordData } from '@shared/types/auth.type';
import type { IMessageResponse } from '@shared/interfaces/api/response.interface';
import type { TFormHandlerStore } from '@/stores';
import type { THandlerComponentProps } from '@/@types/handler-types';

// External Libraries
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/form-ui/form';

// Hooks
import { type FormInputs, useInput } from '@/hooks/use-input';

// Stores
import { useStore } from 'zustand';
import { AppCard } from '../layout-ui/app-card';
import type { TFieldConfigObject } from '@/@types/form/field-config.type';
import { ForgotPasswordDto } from '@shared/dtos/auth-dtos/forgot-password.dto';
import { dtoToFields } from '@/lib/fields/dto-to-feilds';

interface IForgotPasswordFormProps extends THandlerComponentProps<TFormHandlerStore<TForgotPasswordData, IMessageResponse, Record<string, any>>> {
}

const ForgotPasswordForm = React.memo(function ForgotPasswordForm({
  storeKey,
  store,
}: IForgotPasswordFormProps) {
  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isSubmitting = useStore(store, state => state.isSubmitting);

  const fields = dtoToFields(ForgotPasswordDto, {}) as TFieldConfigObject<TForgotPasswordData>;

  const inputs = useInput<TForgotPasswordData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TForgotPasswordData>;

  return (
    <Form<TForgotPasswordData, IMessageResponse>
      formStore={store}
    >
      <AppCard
        header={
          <>
            <h2 className="text-md font-semibold">Forgot Password</h2>
            <p className="text-sm text-muted-foreground">Enter your email address and we'll send you instructions to reset your password</p>
          </>
        }
        footer={
          <div className="flex flex-col gap-4 w-full">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Instructions
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="text-secondary hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4 w-full">
          {inputs.email}
        </div>
      </AppCard>
    </Form>
  );
});

export default ForgotPasswordForm;
