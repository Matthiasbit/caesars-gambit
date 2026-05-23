import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";

export async function startGame(id: number) {
  return postJson<void>(`/api/rooms/start/${id}`);
}

export function useStartGame(options?: UseMutationOptions<void, Error, number>) {
  return useMutation({
    mutationFn: startGame,
    ...options,
  });
}
