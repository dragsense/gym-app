// React & Hooks
import React, { type ReactNode, useEffect } from "react";

// External Libraries
import { type FieldValues, useForm } from "react-hook-form";


// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { type IMessageResponse } from "@shared/interfaces/api/response.interface";

// UI Components
import { Form } from "@/components/ui/form";


// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";


// Stores
import { deregisterStore, registerStore, useFormHandlerStore, useRegisteredStore, type TFormHandlerStore } from "@/stores";
import { toast } from "sonner";
import { type TQueryParams } from "@shared/types/api/param.type";
import { useShallow } from "zustand/shallow";
import { getDirtyData, pickKeys } from "@/utils";
import { type ClassConstructor } from "class-transformer";
import { classValidatorResolver } from "@/lib/validation";


export interface IFormHandlerProps<TFormData, TResponse, TExtraProps extends Record<string, any> = {}> {
  initialParams?: TQueryParams;
  mutationFn: (data: TFormData, params?: TQueryParams) => Promise<TResponse | IMessageResponse | void>;
  FormComponent: React.ComponentType<{
    storeKey: string,
    store: TFormHandlerStore<TFormData, TResponse, TExtraProps>
  }>;
  isEditing?: boolean;
  formProps?: TExtraProps;
  onSuccess?: (response: TResponse | IMessageResponse | void) => void;
  onError?: (error: Error) => void;
  initialValues: Readonly<TFormData>;
  validationMode?: EVALIDATION_MODES;
  dto: ClassConstructor<any>;
  storeKey: string;

}


export function FormHandler<TFormData extends FieldValues, TResponse = any, TExtraProps extends Record<string, any> = {}>({
  initialParams = {},
  mutationFn,
  FormComponent,
  formProps,
  isEditing = false,
  onSuccess,
  onError,
  initialValues,
  validationMode = EVALIDATION_MODES.OnChange,
  dto,
  storeKey,
}: IFormHandlerProps<TFormData, TResponse, TExtraProps>) {

  const formStoreKey = storeKey + "-form";


  let store = useRegisteredStore<TFormHandlerStore<TFormData, TResponse, TExtraProps>>(formStoreKey,);
  if (!store) {
    store = useFormHandlerStore<TFormData, TResponse, TExtraProps>(initialValues, formProps || {} as TExtraProps, isEditing);
    registerStore<TFormHandlerStore<TFormData, TResponse, TExtraProps>>(formStoreKey, store);
  }

  const filteredExtra = store(useShallow((state) => pickKeys(state.extra, Object.keys(initialParams) as (keyof typeof initialParams)[])
  ));


  const form = useForm<TFormData>({
    resolver: classValidatorResolver(dto),
    defaultValues: async () => initialValues,
    mode: validationMode,
  });

  const handleSubmit = async (formData: TFormData) => {

    const isEditing = store.getState().isEditing;

    if (isEditing) {
      formData = getDirtyData(formData, initialValues) as TFormData;
    }

    try {
      store.getState().syncWithMutation({
        isSubmitting: true,
        error: null,
        isSuccess: false,
        response: null,
      });

      const response = await mutationFn(formData, { ...initialParams, filteredExtra });

      store.getState().syncWithMutation({
        isSubmitting: false,
        error: null,
        isSuccess: true,
        response,
      });

      toast.success("Form submitted successfully!");
      onSuccess?.(response);
    } catch (error: any) {
      store.getState().syncWithMutation({
        isSubmitting: false,
        error,
        isSuccess: false,
        response: null,
      });

      toast.error(`Failed to submit form: ${error.message}`);
      onError?.(error);
    }
  };

  useEffect(() => {
    registerStore(formStoreKey, store);
    store.getState().setOnSubmit(form.handleSubmit(handleSubmit));
    return () => {
      deregisterStore(formStoreKey);
      store.getState().reset();
    };
  }, [formStoreKey]);





  const FormWrapper = ({ children }: { children: ReactNode }) => <Form {...form}>

    {children}
  </Form>;


  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <FormWrapper>
        <FormComponent
          storeKey={storeKey}
          store={store} />
      </FormWrapper>
    </ErrorBoundary >
  );
}
