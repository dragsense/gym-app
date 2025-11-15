// React
import React, { useState, useId, useMemo, useTransition, type ReactNode } from 'react';

// Types
import { type TSignupData } from '@shared/types/auth.type';
import { type IMessageResponse } from '@shared/interfaces/api/response.interface';
import { type TFormHandlerStore } from '@/stores';
import { type THandlerComponentProps } from '@/@types/handler-types';

// External Libraries
import { Eye, EyeOff, Mail, Loader2, User } from 'lucide-react';
import { Link } from 'react-router-dom';

// Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/form-ui/form';

// Hooks
import { type FormInputs, useInput } from '@/hooks/use-input';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useI18n } from '@/hooks/use-i18n';
import { buildSentence } from '@/locales/translations';

// Stores
import { AppCard } from '../layout-ui/app-card';
import { SignupUserLevel } from '@shared/enums/user.enum';
import { EUserLevels } from '@shared/enums/user.enum';

interface ISignupFormProps extends THandlerComponentProps<TFormHandlerStore<TSignupData, IMessageResponse, any>> {
}

const SignupForm = React.memo(function SignupForm({
  storeKey,
  store,
}: ISignupFormProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  const { t } = useI18n();

  const { user } = useAuthUser();

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
    },
    email: {
      ...originalFields.email,
      startAdornment: <Mail className="h-4 w-4 text-muted-foreground" />
    },
    firstName: {
      ...originalFields.firstName,
      startAdornment: <User className="h-4 w-4 text-muted-foreground" />
    },
    lastName: {
      ...originalFields.lastName,
      startAdornment: <User className="h-4 w-4 text-muted-foreground" />
    },
    trainer: {
      ...originalFields.trainer,
      renderItem: (item) => {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.experience}
            {item.specialization}
          </div>
        );
      },
      visible: (ctx) => {
        const { values } = ctx;
        return values.level == SignupUserLevel.TRAINER;
      }
    }
  }), [originalFields, showPassword, showConfirmPassword]);

  const inputs = useInput<TSignupData>({
    fields: fields as any,
    showRequiredAsterisk: true
  }) as FormInputs<TSignupData>;

  return (
    <Form<TSignupData, IMessageResponse>
      formStore={store}
    >
      <AppCard
        header={
          <>
            <h2 className="text-md font-semibold">{buildSentence(t, 'signup')}</h2>
            <p className="text-sm text-muted-foreground">{buildSentence(t, 'create', 'your', 'account', 'with', 'your', 'email', 'and', 'password')}</p>
          </>
        }
        footer={
          <div className="flex flex-col gap-4 w-full">
            <Button type="submit" className="w-full" disabled={isSubmitting} data-component-id={componentId}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buildSentence(t, 'signup')}
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {buildSentence(t, 'already', 'have', 'an', 'account')}?{' '}
                <Link to="/login" className="hover:underline">
                  {buildSentence(t, 'login')}
                </Link>
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-6">


          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{buildSentence(t, 'join', 'as')}</h3>
            <div className="space-y-4">
              {inputs.level}
            </div>
          </div>


          {/* Account Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{buildSentence(t, 'account', 'information')}</h3>
            <div className="space-y-4">
              {inputs.email}
              {inputs.password}
              {inputs.confirmPassword}
            </div>
          </div>

          {/* Profile Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{buildSentence(t, 'profile', 'information')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputs.firstName}
              {inputs.lastName}
            </div>
          </div>
          <div>
            {inputs.trainer as ReactNode}
          </div>

        </div>
      </AppCard>
    </Form>
  );
});

export default SignupForm;