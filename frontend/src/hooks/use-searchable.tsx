// hooks/use-searchable-resource.ts
import { IListQueryParams } from "@shared/interfaces/api/param.interface";
import { useApiPaginatedQuery } from "./use-api-paginated-query";

import { IUser } from "@shared/interfaces/user.interface";
import { fetchUsers } from "@/services/user.api";

export function useSearchableResource<T>(
  key: string,
  fetcher: (params: IListQueryParams) => Promise<any>,
  initialParams: IListQueryParams = { page: 1, limit: 10 }
) {
  const { data, isLoading, error, setFilters } = useApiPaginatedQuery<T>(
    [key],
    fetcher,
    initialParams
  );

  return {
    response: data,
    isLoading,
    error,
    setFilters,
  };
}



export function useSearchableUsers({ level, initialParams }: { level?: number, initialParams?: IListQueryParams }) {
  return useSearchableResource<IUser>(
    "searchable-users" + (level ? `-${level}` : ""),
    (params: IListQueryParams) => fetchUsers(params, level),
    initialParams
  );
}
