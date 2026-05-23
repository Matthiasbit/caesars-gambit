import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";

export async function joinRoom(id: number, host: boolean = false) {
  return postJson<void>(`/api/rooms/join/${id}`, { host });
}

export function useJoinRoom(options?: UseMutationOptions<void, Error, { id: number; host?: boolean }>) {
  return useMutation({
    mutationFn: ({ id, host = false }) => joinRoom(id, host),
    ...options,
  });
}
