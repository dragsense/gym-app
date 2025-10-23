import { useState, useDeferredValue, useMemo } from 'react';
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

  // React 19: Deferred params for better performance
  const deferredParams = useDeferredValue(params);
  
  // React 19: Memoized query key for better performance
  const memoizedQueryKey = useMemo(() => 
    [...(Array.isArray(queryKey) ? queryKey : [queryKey]), deferredParams], 
    [queryKey, deferredParams]
  );

  const query = useQuery<T, Error>({
    queryKey: memoizedQueryKey,
    queryFn: () => queryFn(deferredParams),
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
