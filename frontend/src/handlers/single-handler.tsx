// React & Hooks
import React, { useEffect, useCallback, useTransition, useDeferredValue, useSyncExternalStore, useInsertionEffect } from "react";

// Types
import {
  type IActionComponent,
} from "@/@types/handler-types";
import { type TQueryParams } from "@shared/types/api/param.type";


// Custom Hooks
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useConfirm } from "@/hooks/use-confirm";

// External Libraries
import { toast } from "sonner";

// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";

// UI Components
import { ConfirmDialog } from "@/components/layout-ui/app-alert-dialog";
import { ActionComponentHandler } from "./action-handler";

// Stores
import { deregisterStore, registerStore, type TSingleHandlerStore, useRegisteredStore, useSingleHandlerStore } from "@/stores";

// Hooks
import { useApiQuery } from "@/hooks/use-api-query";
import { pickKeys } from "@/utils";
import { useShallow } from "zustand/shallow";
import { useI18n } from "@/hooks/use-i18n";
import { buildSentence } from "@/locales/translations";


export interface ISingleHandlerProps<
  IData,
  TExtraProps extends Record<string, any> = {},
> {
  storeKey: string;
  listStoreKey?: string;
  enabled?: boolean;
  name?: string;
  initialParams?: TQueryParams;
  queryFn: (id: string, queryParams: TQueryParams) => Promise<IData>;
  deleteFn?: (id: string) => Promise<void>;
  onDeleteSuccess?: () => void;
  SingleComponent: React.ComponentType<{ storeKey: string, store: TSingleHandlerStore<IData, TExtraProps> }>;
  actionComponents?: IActionComponent<TSingleHandlerStore<IData, TExtraProps>>[];
  singleProps?: TExtraProps;
}

export function SingleHandler<
  IData,
  TExtraProps extends Record<string, any> = {}
>({
  name = "Item",
  initialParams = {},
  enabled = false,
  queryFn,
  deleteFn = () => Promise.resolve(),
  onDeleteSuccess,
  storeKey,
  SingleComponent,
  singleProps,
  actionComponents = []
}: ISingleHandlerProps<
  IData,
  TExtraProps
>) {

  const { confirm, dialogProps } = useConfirm();
  const { t } = useI18n();
  // React 19: Enhanced transitions for better UX
  const [, startTransition] = useTransition();

  const singleStoreKey = storeKey + "-single";

  let store = useRegisteredStore<TSingleHandlerStore<IData, TExtraProps>>(singleStoreKey);
  if (!store) {
    store = useSingleHandlerStore<IData, TExtraProps>(name, initialParams, singleProps || {} as TExtraProps);
    registerStore<TSingleHandlerStore<IData, TExtraProps>>(singleStoreKey, store);
  }

  useEffect(() => {
    registerStore(singleStoreKey, store);
    return () => deregisterStore(singleStoreKey);
  }, [singleStoreKey, store]);


  const payload = store((state) => state.payload);
  const params = store((state) => state.params);
  const filteredExtra = store(useShallow((state) => pickKeys(state.extra, Object.keys(initialParams) as (keyof typeof initialParams)[])
  ));


  const deferredParams = useDeferredValue(params);
  const deferredFilteredExtra = useDeferredValue(filteredExtra);

  const queryKey = [singleStoreKey, JSON.stringify(payload), JSON.stringify(deferredFilteredExtra)];

  // React 19: Enhanced query with transitions
  useApiQuery<IData>(
    queryKey,
    async (params) => {
      return new Promise((resolve, reject) => {
        startTransition(async () => {
          store.setState({ isLoading: true });
          try {
            const response = await queryFn(payload, { ...params, ...deferredParams, ...deferredFilteredExtra });
            store.setState({
              isLoading: false,
              error: null,
              response: response,
              isSuccess: true,
            });
            resolve(response);
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            store.setState({
              response: null,
              isLoading: false,
              error: err,
              isSuccess: false,
            });
            reject(err);
          }
        });
      });
    },
    {
      ...deferredParams,
      ...deferredFilteredExtra
    },
    {
      enabled: !!payload || enabled,
    }
  );


  // React 19: Enhanced mutation with transitions
  const { mutate: deleteItem } = useApiMutation(
    deleteFn,
    {
      onMutate: () => {
        startTransition(() => {
          store.getState().syncWithQuery({
            isLoading: true,
            error: null,
            isSuccess: false,
          });
        });
      },
      onSuccess: () => {
        startTransition(() => {
          store.getState().syncWithQuery({
            isLoading: false,
            error: null,
            isSuccess: true,
            response: null,
          });
          onDeleteSuccess?.();
          toast.success(`${name} deleted successfully!`);
        });
      },
      onError: (error: Error) => {
        startTransition(() => {
          store.getState().syncWithQuery({
            isLoading: false,
            error,
            isSuccess: false,
          });
          toast.error(`Failed to delete ${name}: ${error.message}`);
        });
      },
    },
  );

  // React 19: Enhanced delete handler with transitions
  const handleDeleteItem = useCallback(
    () =>
      confirm(
        buildSentence(t, 'delete', 'item'),
        buildSentence(t, 'are', 'you', 'sure', 'you', 'want', 'to', 'delete', 'this') + ` ${name}?`,
        () => {
          startTransition(() => {
            deleteItem(payload);
            store.getState().reset()
          });
        },
        () => {
          startTransition(() => {
            store.getState().reset()
          });
        },
        "destructive"
      ),
    [confirm, name, deleteItem, payload, store, startTransition]
  );

  useEffect(() => {
    if (store.getState().action === "delete") {
      handleDeleteItem();
    }
  }, [payload]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <>
        {SingleComponent && (
          <SingleComponent
            storeKey={storeKey}
            store={store}
          />
        )}

        <ActionComponentHandler<IData, TExtraProps>
          actionComponents={actionComponents}
          storeKey={storeKey}
          store={store}
        />

        <ConfirmDialog {...dialogProps} />

      </>
    </ErrorBoundary>
  );
}
