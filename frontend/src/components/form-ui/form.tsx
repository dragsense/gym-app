// React
import type { ReactNode } from 'react';
import { useShallow } from 'zustand/shallow';

// External Libraries
import { Loader2 } from 'lucide-react';


// Utils
import { cn } from '@/lib/utils';

// Stores
import type { TFormHandlerStore } from '@/stores';


interface IFormProps<TFormData, TResponse, TExtraProps extends Record<string, any> = {}> {
  className?: string;
  children: ReactNode;
  formStore: TFormHandlerStore<TFormData, TResponse, TExtraProps>;
}

export function Form<TFormData, TResponse, TExtraProps extends Record<string, any> = {}>({
  className,
  children,
  formStore
}: IFormProps<TFormData, TResponse, TExtraProps>) {

  const { isSubmitting, error, onSubmit } = formStore(useShallow(state => ({
    onSubmit: state.onSubmit,
    isSubmitting: state.isSubmitting,
    error: state.error
  })));
  return (
    <form onSubmit={onSubmit}>
      <div className={cn('relative', className)}>

          {isSubmitting && (
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {children}
          {error && (
            <p className="text-sm font-medium text-red-500 my-2">{error.message}</p>
          )}
 
      </div>
    </form>
  );
}