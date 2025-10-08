// React
import React, { useState } from 'react';

// Types
import type { TLoginData } from '@shared/types/auth.type';
import type { ILoginResponse } from '@shared/interfaces/auth.interface';
import type { TFormHandlerStore } from '@/stores';
import type { THandlerComponentProps } from '@/@types/handler-types';

// External Libraries
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
import { LoginDto } from '@shared/dtos';
import { dtoToFields } from '@/lib/fields/dto-to-feilds';

interface ILoginFormProps extends THandlerComponentProps<TFormHandlerStore<TLoginData, ILoginResponse, any>> {
}

const LoginForm = React.memo(function LoginForm({
  storeKey,
  store,
}: ILoginFormProps) {
  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isSubmitting = useStore(store, state => state.isSubmitting);
  const [showPassword, setShowPassword] = useState(false);

  const fields = dtoToFields(LoginDto, {
    password: {
      type: showPassword ? 'text' : 'password',
      endAdornment: (
        <div className='inline-block cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </div>
      ),
      bottomAdornment: (
        <span className="text-right inline-block cursor-pointer">
          <Link to="/forgot-password" className="text-sm hover:underline">
            Forgot password?
          </Link>
        </span>
      )
    }
  }) as TFieldConfigObject<TLoginData>;

  const inputs = useInput<TLoginData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TLoginData>;

  return (
    <Form<TLoginData, ILoginResponse>
      formStore={store}
    >
      <AppCard
        header={
          <>
            <h2 className="text-md font-semibold">Login</h2>
            <p className="text-sm text-muted-foreground">Enter your email and password to login to your account</p>
          </>
        }
        footer={
          <div className="flex flex-col gap-4 w-full">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-secondary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4 w-full">
          {inputs.email}
          {inputs.password}
        </div>
      </AppCard>
    </Form>
  );
});

export default LoginForm;