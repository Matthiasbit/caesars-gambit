import type { UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";
import { queryKeys } from "./queryKeys";
import { useApiMutation } from "./useApiMutation";

export async function leaveRoom(id: number) {
  return postJson<void>(`/api/rooms/leave/${id}`);
}

export function useLeaveRoom(options?: UseMutationOptions<void, Error, number>) {
  return useApiMutation({
    mutationFn: (id: number) => leaveRoom(id),
    invalidateQueryKeys: [queryKeys.rooms, queryKeys.currentUser],
    ...options,
  });
}
