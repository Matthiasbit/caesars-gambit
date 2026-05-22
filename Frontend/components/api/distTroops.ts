import type { UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";
import { queryKeys } from "./queryKeys";
import { useApiMutation } from "./useApiMutation";

export type DistTroopsPayload = {
  sum: number;
  to: string;
  roomId: string;
};

export async function distTroops({ sum, to, roomId }: DistTroopsPayload) {
  return postJson<void>("/api/game/distTroops", { to, sum, roomId });
}

export function useDistTroops(options?: UseMutationOptions<void, Error, DistTroopsPayload>) {
  return useApiMutation({
    mutationFn: distTroops,
    invalidateQueryKeys: [queryKeys.roomState],
    ...options,
  });
}
