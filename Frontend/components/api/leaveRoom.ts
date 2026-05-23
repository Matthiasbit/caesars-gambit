import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";

export async function leaveRoom(id: number) {
  return postJson<void>(`/api/rooms/leave/${id}`);
}

export function useLeaveRoom(options?: UseMutationOptions<void, Error, number>) {
  return useMutation({
    mutationFn: (id: number) => leaveRoom(id),
    ...options,
  });
}
