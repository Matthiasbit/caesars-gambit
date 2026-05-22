import type { UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";
import { queryKeys } from "./queryKeys";
import { useApiMutation } from "./useApiMutation";

export async function endTurn(roomId: string) {
  return postJson<void>("/api/game/endTurn", { roomId });
}

export function useEndTurn(options?: UseMutationOptions<void, Error, string>) {
  return useApiMutation({
    mutationFn: endTurn,
    invalidateQueryKeys: [queryKeys.roomState],
    ...options,
  });
}
