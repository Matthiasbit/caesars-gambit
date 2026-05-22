import type { UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";
import { queryKeys } from "./queryKeys";
import { useApiMutation } from "./useApiMutation";

export async function joinRoom(id: number, host: boolean = false) {
  return postJson<void>(`/api/rooms/join/${id}`, { host });
}

export function useJoinRoom(options?: UseMutationOptions<void, Error, { id: number; host?: boolean }>) {
  return useApiMutation({
    mutationFn: ({ id, host = false }) => joinRoom(id, host),
    invalidateQueryKeys: [queryKeys.rooms, queryKeys.currentUser],
    ...options,
  });
}
