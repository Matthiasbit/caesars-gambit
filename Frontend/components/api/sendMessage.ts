import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";

export type SendMessagePayload = {
  id: number;
  message: string;
};

export async function sendMessage({ id, message }: SendMessagePayload) {
  return postJson<void>(`/api/rooms/message/${id}`, { message });
}

export function useSendMessage(options?: UseMutationOptions<void, Error, SendMessagePayload>) {
  return useMutation({
    mutationFn: sendMessage,
    ...options,
  });
}
