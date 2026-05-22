import type { UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";
import { queryKeys } from "./queryKeys";
import { useApiMutation } from "./useApiMutation";

export type SendMessagePayload = {
  id: number;
  message: string;
};

export async function sendMessage({ id, message }: SendMessagePayload) {
  return postJson<void>(`/api/rooms/message/${id}`, { message });
}

export function useSendMessage(options?: UseMutationOptions<void, Error, SendMessagePayload>) {
  return useApiMutation({
    mutationFn: sendMessage,
    invalidateQueryKeys: [queryKeys.roomState],
    ...options,
  });
}
