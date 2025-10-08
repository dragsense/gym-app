// React
import React, { useState } from 'react';

// Types
import type{ TSignupData } from '@shared/types/auth.type';
import type { IMessageResponse } from '@shared/interfaces/api/response.interface';
import type { TFormHandlerStore } from '@/stores';
import type { THandlerComponentProps } from '@/@types/handler-types';

// External Libraries
import { Eye, EyeOff, Mail, Loader2, User } from 'lucide-react';
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
import { SignupDto } from '@shared/dtos';
import { dtoToFields } from '@/lib/fields/dto-to-feilds';

interface ISignupFormProps extends THandlerComponentProps<TFormHandlerStore<TSignupData, IMessageResponse, any>> {
}

const SignupForm = React.memo(function SignupForm({
  storeKey,
  store,
}: ISignupFormProps) {
  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isSubmitting = useStore(store, state => state.isSubmitting);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fields = dtoToFields(SignupDto, {
    password: {
      type: showPassword ? 'text' : 'password',
      endAdornment: (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )
    },
    confirmPassword: {
      type: showConfirmPassword ? 'text' : 'password',
      endAdornment: (
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="text-muted-foreground hover:text-foreground"
        >
          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )
    },
    email: {
      startAdornment: <Mail className="h-4 w-4 text-muted-foreground" />
    },
    firstName: {
      startAdornment: <User className="h-4 w-4 text-muted-foreground" />
    },
    lastName: {
      startAdornment: <User className="h-4 w-4 text-muted-foreground" />
    }
  }) as TFieldConfigObject<TSignupData>;

  const inputs = useInput<TSignupData>({
    fields,
    showRequiredAsterisk: true
  }) as FormInputs<TSignupData>;

  return (
    <Form<TSignupData, IMessageResponse>
      formStore={store}
    >
      <AppCard
        header={
          <>
            <h2 className="text-md font-semibold">Sign Up</h2>
            <p className="text-sm text-muted-foreground">Create your account with your email and password</p>
          </>
        }
        footer={
          <div className="flex flex-col gap-4 w-full">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-secondary hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Account Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Account Information</h3>
            <div className="space-y-4">
              {inputs.email}
              {inputs.password}
              {inputs.confirmPassword}
            </div>
          </div>

          {/* Profile Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputs.firstName}
              {inputs.lastName}
            </div>
          </div>
        </div>
      </AppCard>
    </Form>
  );
});

export default SignupForm;