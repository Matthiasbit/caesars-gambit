import type { UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";
import { queryKeys } from "./queryKeys";
import { useApiMutation } from "./useApiMutation";

export async function startGame(id: number) {
  return postJson<void>(`/api/rooms/start/${id}`);
}

export function useStartGame(options?: UseMutationOptions<void, Error, number>) {
  return useApiMutation({
    mutationFn: startGame,
    invalidateQueryKeys: [queryKeys.roomState],
    ...options,
  });
}
