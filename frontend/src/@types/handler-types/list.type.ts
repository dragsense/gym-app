// Types
import type { StoreApi } from "zustand";
import type { TItemActionProps } from ".";
import type { IListPaginationState } from "@shared/interfaces/api/response.interface";

export interface IListQueryState {
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  search: string;
}

export interface IListHandlerBaseState<TResponse> {
  response: TResponse[] | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  pagination: IListPaginationState;
  itemAction: TItemActionProps | null;
}

export interface IListHandlerState<TResponse, TExtra extends Record<string, any> = {}> extends IListHandlerBaseState<TResponse>, IListQueryState {
  
  extra: TExtra;

  setExtra: <K extends keyof TExtra>(key: K, value: TExtra[K]) => void;
  resetExtra: () => void;

  setFilters: (filters: Record<string, any>) => void;
  setSort: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void;
  setSearch: (search: string) => void;
  setPagination: (pagination: Partial<IListPaginationState>) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setResponse: (response: TResponse[]) => void;
  syncWithQuery: (queryState: IListHandlerBaseState<TResponse>) => void;
  setItemAction: (action: TItemActionProps | null) => void;
  reset: () => void;
}

export type IListStoreApi<TResponse, TExtra extends Record<string, any>> = StoreApi<IListHandlerState<TResponse, TExtra>>;
