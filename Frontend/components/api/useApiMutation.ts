import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions } from "@tanstack/react-query";

type ApiMutationOptions<TData, TError, TVariables, TContext> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateQueryKeys?: readonly QueryKey[];
} & Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutationFn">;

export function useApiMutation<TData, TError = Error, TVariables = void, TContext = unknown>({
  mutationFn,
  invalidateQueryKeys = [],
  onSuccess,
  ...options
}: ApiMutationOptions<TData, TError, TVariables, TContext>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context) => {
      if (invalidateQueryKeys.length > 0) {
        await Promise.all(
          invalidateQueryKeys.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey })
          )
        );
      }
      await onSuccess?.(data, variables, context);
    },
  });
}
