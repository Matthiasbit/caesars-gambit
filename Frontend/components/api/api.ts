import { buildAuthRedirectUrl } from "@/lib/invite";
import { getAuthLoginReason } from "@/lib/authMessages";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiUrl(path: string) {
  return path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
}

export function defaultApiHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    credentials: "include",
    headers: { ...defaultApiHeaders(), ...(init.headers ?? {}) },
    ...init,
  });

  const responseText = await response.text().catch(() => "");
  
  if (response.status === 403) {
    if (typeof window !== "undefined") {
      if (window.location.pathname !== "/") {
        const redirectTo = `${window.location.pathname}${window.location.search}`;
        window.location.href = buildAuthRedirectUrl(
          "/auth/login",
          redirectTo,
          getAuthLoginReason(redirectTo)
        );
      }
    }
    throw new ApiError(
      response.status,
      `API request failed with status ${response.status} ${response.statusText}`,
      responseText
    );
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `API request failed with status ${response.status} ${response.statusText}`,
      responseText
    );
  }

  if (response.status === 204 || responseText.length === 0) {
    return undefined as unknown as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return responseText as unknown as T;
  }
}

export function getJson<T>(path: string) {
  return apiFetch<T>(path, { method: "GET" });
}

export function postJson<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function putJson<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
