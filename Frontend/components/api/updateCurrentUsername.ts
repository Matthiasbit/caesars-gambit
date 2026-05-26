import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { UserDto } from "@/types/dto";
import { ApiError, putJson } from "./api";

export type UpdateCurrentUsernamePayload = {
  username: string;
};

export async function updateCurrentUsername({ username }: UpdateCurrentUsernamePayload) {
  try {
    return await putJson<UserDto>("/api/user/username", { username });
  } catch (error) {
    if (error instanceof ApiError && error.body) {
      const parsedBody = JSON.parse(error.body) as { error?: string };
      if (parsedBody.error) {
        throw new Error(parsedBody.error);
      }
    }

    throw error;
  }
}

export function useUpdateCurrentUsername(
  options?: UseMutationOptions<UserDto, Error, UpdateCurrentUsernamePayload>
) {
  return useMutation({
    mutationFn: updateCurrentUsername,
    ...options,
  });
}