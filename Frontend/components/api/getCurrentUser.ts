import { useQuery } from "@tanstack/react-query";
import type { UserDto } from "@/types/dto";
import { getJson, ApiError } from "./api";


export async function getCurrentUser() {
  try {
    return await getJson<UserDto>("/api/user/currentUser");
  } catch (err: unknown) {
    // Treat 403 as "not authenticated" and return null so the UI can
    // render the public main page instead of redirecting or showing an error.
    if (err instanceof ApiError && err.status === 403) {
      return null as unknown as UserDto | null;
    }
    throw err;
  }
}

export function useGetCurrentUser() {
  return useQuery({ queryKey: ["currentUser"], queryFn: getCurrentUser });
}
