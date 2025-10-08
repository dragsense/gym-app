// React & Hooks
import React, { useEffect } from "react";

// Types
import { type IPaginatedResponse } from "@shared/interfaces/api/response.interface";
import {
  type IListQueryParams,
} from "@shared/interfaces/api/param.interface";

// Custom Hooks
import { useApiPaginatedQuery } from "@/hooks/use-api-paginated-query";

// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";


// Stores
import { registerStore, deregisterStore, type TListHandlerStore, useListHandlerStore, useRegisteredStore, type TSingleHandlerStore } from "@/stores";
import { useShallow } from "zustand/shallow";
import { pickKeys } from "@/utils";


interface IListHandlerProps<
  TData,
  TExtraProps extends Record<string, any> = {},
> {
  storeKey: string;
  queryFn: (params: IListQueryParams) => Promise<IPaginatedResponse<TData>>;
  ListComponent: React.ComponentType<{ storeKey: string, store: TListHandlerStore<TData, TExtraProps> }>;
  listProps?: TExtraProps;
  initialParams?: IListQueryParams;
};

export function ListHandler<
  TData,
  TExtraProps extends Record<string, any> = {},
>({
  queryFn,
  ListComponent,
  initialParams = {},
  listProps,
  storeKey
}: IListHandlerProps<
  TData,
  TExtraProps
>) {
  const listStoreKey = storeKey + "-list"

  let store = useRegisteredStore<TListHandlerStore<TData, TExtraProps>>(listStoreKey);
  if (!store) {
    store = useListHandlerStore<TData, TExtraProps>(initialParams, listProps || {} as TExtraProps);
    registerStore<TListHandlerStore<TData, TExtraProps>>(listStoreKey, store);
  }

  useEffect(() => {
    registerStore(listStoreKey, store);
    return () => deregisterStore(listStoreKey);
  }, [listStoreKey, store]);


  const filteredExtra = store(
    useShallow((state) =>
      pickKeys(
        state.extra,
        Object.keys(initialParams.filters || {}) as (keyof typeof initialParams)[]
      )
    )
  );


  const queryKey = [listStoreKey, JSON.stringify(filteredExtra)];


  const { setFilters, setLimit, setPage } = useApiPaginatedQuery<TData>(queryKey, async (params) => {
    store.setState({ isLoading: true });
    try {
      const response = await queryFn(params);
      store.setState({
        response: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          lastPage: response.lastPage,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage
        },
        isLoading: false,
        error: null,
        isSuccess: true,
        filters: params.filters || {},
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'DESC',
        search: params.search || ''
      });
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      store.setState({
        response: null,
        pagination: {
          page: 1,
          limit: initialParams.limit || 10,
          total: 0,
          lastPage: 1,
          hasNextPage: false,
          hasPrevPage: false
        },
        isLoading: false,
        error: err,
        isSuccess: false,
        filters: {},
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        search: ''
      });
      throw err;
    }
  }, {
    page: initialParams.page || 1,
    limit: initialParams.limit || 10,
    sortBy: initialParams.sortBy || 'createdAt',
    sortOrder: initialParams.sortOrder || 'DESC',
    search: initialParams.search || '',
    filters: {
      ...initialParams.filters || {},
      ...filteredExtra || {}
    }
  });

  useEffect(() => {
    const unsub = store.subscribe((state) => {
      setPage(state.pagination.page);
      setLimit(state.pagination.limit);
      setFilters(state.filters);
    });
    return unsub;
  }, [store, setPage, setLimit, setFilters, ]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ListComponent
        storeKey={storeKey}
        store={store}
      />
    </ErrorBoundary>
  );
}
