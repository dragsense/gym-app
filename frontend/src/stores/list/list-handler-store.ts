// External Libraries
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types 
import type{ IListHandlerBaseState, IListHandlerState } from '@/@types/handler-types/list.type';
import type { IListPaginationState } from '@shared/interfaces/api/response.interface';

// Config
import { config } from '@/config';

const initialPaginationState: IListPaginationState = {
  page: 1,
  limit: 10,
  total: 0,
  lastPage: 1,
  hasNextPage: false,
  hasPrevPage: false
};

export const useListHandlerStore = <TResponse, TExtra extends Record<string, any> = {}>(initialFilters: Record<string, any> = {}, initialExtra: TExtra = {} as TExtra) => {
  return create<IListHandlerState<TResponse, TExtra>>()(
    devtools(
      (set) => ({
        // Base state
        isLoading: false,
        error: null,
        response: null,
        isSuccess: false,
        pagination: initialPaginationState,
        itemAction: null,

        extra: initialExtra,

        // Query state
        filters: initialFilters,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        search: '',

        // Setters
        setFilters: (filters) => set({ filters }),
        setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
        setSearch: (search) => set({ search }),
        setPagination: (pagination) => set((state) => ({
          pagination: { ...state.pagination, ...pagination }
        })),
        setIsLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setResponse: (response) => set({ response }),

        // Item action setter 
        setItemAction: (action) => set({ itemAction: action }),

        setExtra: (key, value) =>
          set((state) => ({
            extra: {
              ...state.extra,
              [key]: value,
            },
          })),

        resetExtra: () =>
          set({
            extra: initialExtra,
          }),


        // Query sync
        syncWithQuery: ({ isLoading, error, isSuccess, response, pagination }) => {
          const update: Partial<IListHandlerBaseState<TResponse>> = {
            isLoading,
            error,
            isSuccess
          };
          if (response !== undefined) {
            update.response = response;
          }
          if (pagination !== undefined) {
            update.pagination = { ...initialPaginationState, ...pagination };
          }
          set(update);
        },
        reset: () => set({
          isLoading: false,
          error: null,
          response: null,
          isSuccess: false,
          pagination: initialPaginationState,
          filters: initialFilters,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
          search: ''
        })
      }),
      {
        name: 'list-handler-store',
        enabled: config.environment === 'development'
      }
    )
  );
};

export type TListHandlerStore<TResponse, TExtra extends Record<string, any>> = ReturnType<typeof useListHandlerStore<TResponse, TExtra>>;
