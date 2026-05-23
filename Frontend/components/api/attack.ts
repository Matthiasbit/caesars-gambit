import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { postJson } from "./api";

export type AttackPayload = {
  sum: number;
  from: string;
  to: string;
  roomId: string;
};

export async function attack({ sum, from, to, roomId }: AttackPayload) {
  return postJson<void>("/api/game/attack", { from, to, sum, roomId });
}

export function useAttack(options?: UseMutationOptions<void, Error, AttackPayload>) {
  return useMutation({
    mutationFn: attack,
    ...options,
  });
}
