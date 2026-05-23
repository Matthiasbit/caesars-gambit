import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";

export async function createRoom() {
  return postJson<number>("/api/rooms/create");
}

export function useCreateRoom(options?: UseMutationOptions<number, Error, void>) {
  return useMutation({
    mutationFn: createRoom,
    ...options,
  });
}
