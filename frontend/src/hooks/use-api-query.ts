import { useState } from 'react';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { TQueryParams } from '@shared/types/api/param.type';

export function useApiQuery<T = any>(
  queryKey: string | any[],
  queryFn: (params: TQueryParams) => Promise<T>,
  initialParams: TQueryParams,
  options?: Omit<
    UseQueryOptions<T, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const [params, setParams] = useState(initialParams);

  const query = useQuery<T, Error>({
    queryKey: [...(Array.isArray(queryKey) ? queryKey : [queryKey]), params],
    queryFn: () => queryFn(params),
    ...options,
  });


  const setQueryParams = (params: TQueryParams) => {
    setParams((prev) => ({ ...prev, ...params }));
  };

  return {
    ...query,
    params,
    setQueryParams,
  };
}
