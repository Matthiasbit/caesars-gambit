import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";

export async function endTurn(roomId: string) {
  return postJson<void>("/api/game/endTurn", { roomId });
}

export function useEndTurn(options?: UseMutationOptions<void, Error, string>) {
  return useMutation({
    mutationFn: endTurn,
    ...options,
  });
}
