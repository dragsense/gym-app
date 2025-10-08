import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';

type ApiFunction<T = any, P = any> = (params: P) => Promise<T>;

export function useApiMutation<T = any, P = any>(
  mutationFn: ApiFunction<T, P>,
  options?: UseMutationOptions<T, Error, P>
): UseMutationResult<T, Error, P> & {
  reset: () => void;
} {
  const mutation = useMutation<T, Error, P>({
    mutationFn,
    ...options,
  });


  return {
    ...mutation,
    reset: () => mutation.reset(),
  };
}