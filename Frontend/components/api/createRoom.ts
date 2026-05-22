import type { UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";
import { queryKeys } from "./queryKeys";
import { useApiMutation } from "./useApiMutation";

export async function createRoom() {
  return postJson<number>("/api/rooms/create");
}

export function useCreateRoom(options?: UseMutationOptions<number, Error, void>) {
  return useApiMutation({
    mutationFn: createRoom,
    invalidateQueryKeys: [queryKeys.rooms, queryKeys.currentUser],
    ...options,
  });
}
