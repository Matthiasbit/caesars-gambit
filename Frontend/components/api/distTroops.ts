import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";

export type DistTroopsPayload = {
  sum: number;
  to: string;
  roomId: string;
};

export async function distTroops({ sum, to, roomId }: DistTroopsPayload) {
  return postJson<void>("/api/game/distTroops", { to, sum, roomId });
}

export function useDistTroops(options?: UseMutationOptions<void, Error, DistTroopsPayload>) {
  return useMutation({
    mutationFn: distTroops,
    ...options,
  });
}
