// hooks/use-searchable-resource.ts
import { useMemo, useDeferredValue } from "react";
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import { useApiPaginatedQuery } from "./use-api-paginated-query";

import type { IUser } from "@shared/interfaces/user.interface";
import { fetchUsers } from "@/services/user.api";
import { fetchTrainers } from "@/services/trainer.api";
import type { IClient, IPaginatedResponse, IPermission, IResource, ITrainer } from "@shared/interfaces";
import { fetchClients } from "@/services/client.api";
import { fetchPermissions, fetchResources } from "@/services/roles.api";

export function useSearchableResource<T>(
  key: string,
  fetcher: (params: IListQueryParams) => Promise<IPaginatedResponse<T>>,
  initialParams: IListQueryParams = { page: 1, limit: 10 }
) {
  // React 19: Memoized key for better performance
  const memoizedKey = useMemo(() => [key], [key]);

  // React 19: Deferred initial params for better performance
  const deferredInitialParams = useDeferredValue(initialParams);

  const { data, isLoading, error, setFilters } = useApiPaginatedQuery<T>(
    memoizedKey,
    fetcher,
    deferredInitialParams
  );

  // React 19: Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    response: data,
    isLoading,
    error,
    setFilters,
  }), [data, isLoading, error, setFilters]);
}



export function useSearchableUsers({ level, initialParams }: { level?: number, initialParams?: IListQueryParams }) {
  // React 19: Memoized key generation for better performance
  const memoizedKey = useMemo(() =>
    "searchable-users" + (level ? `-${level}` : ""),
    [level]
  );

  // React 19: Memoized fetcher for better performance
  const memoizedFetcher = useMemo(() =>
    (params: IListQueryParams) => fetchUsers(params, level),
    [level]
  );

  return useSearchableResource<IUser>(
    memoizedKey,
    memoizedFetcher,
    { ...initialParams, _relations: 'profile' }
  );
}


export function useSearchableTrainers({ initialParams }: { initialParams?: IListQueryParams }) {
  // React 19: Memoized key generation for better performance
  const memoizedKey = "searchable-trainers";

  // React 19: Memoized fetcher for better performance
  const memoizedFetcher = useMemo(() =>
    (params: IListQueryParams) => fetchTrainers({
      ...params,
      _relations: 'user.profile',
      _select: 'id, user.email, user.profile.firstName, user.profile.lastName',
    }),
    []);

  return useSearchableResource<ITrainer>(
    memoizedKey,
    memoizedFetcher,
    initialParams
  );
}



export function useSearchableClients({ initialParams }: { initialParams?: IListQueryParams }) {
  // React 19: Memoized key generation for better performance
  const memoizedKey = "searchable-clients";

  // React 19: Memoized fetcher for better performance
  const memoizedFetcher = useMemo(() =>
    (params: IListQueryParams) => fetchClients({
      ...params,
      _relations: 'user.profile',
      _select: 'id, user.email, user.profile.firstName, user.profile.lastName',
    }),
    []);

  return useSearchableResource<IClient>(
    memoizedKey,
    memoizedFetcher,
    initialParams
  );
}


export function useSearchableResources({ initialParams }: { initialParams?: IListQueryParams }) {
  // React 19: Memoized key generation for better performance
  const memoizedKey = "searchable-resources";

  // React 19: Memoized fetcher for better performance
  const memoizedFetcher = useMemo(() =>
    (params: IListQueryParams) => fetchResources(params),
    []);

  return useSearchableResource<IResource>(
    memoizedKey,
    memoizedFetcher,
    initialParams
  );
}


export function useSearchablePermissions({ initialParams }: { initialParams?: IListQueryParams }) {
  // React 19: Memoized key generation for better performance
  const memoizedKey = "searchable-permissions";

  // React 19: Memoized fetcher for better performance
  const memoizedFetcher = useMemo(() =>
    (params: IListQueryParams) => fetchPermissions(params),
    []);

  return useSearchableResource<IPermission>(
    memoizedKey,
    memoizedFetcher,
    initialParams
  );
}