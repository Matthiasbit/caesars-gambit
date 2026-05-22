import type { UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";
import { queryKeys } from "./queryKeys";
import { useApiMutation } from "./useApiMutation";

export type MoveTroopsPayload = {
  sum: number;
  from: string;
  to: string;
  roomId: string;
};

export async function moveTroops({ sum, from, to, roomId }: MoveTroopsPayload) {
  return postJson<void>("/api/game/move", { from, to, sum, roomId });
}

export function useMoveTroops(options?: UseMutationOptions<void, Error, MoveTroopsPayload>) {
  return useApiMutation({
    mutationFn: moveTroops,
    invalidateQueryKeys: [queryKeys.roomState],
    ...options,
  });
}
