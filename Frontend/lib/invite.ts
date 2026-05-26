import { GENERIC_LOGIN_MESSAGE } from "@/lib/authMessages";

const DEFAULT_APP_ORIGIN = "http://localhost:3000";

export const INVITE_LOGIN_MESSAGE = "Zuerst einloggen oder registrieren, um Raum beizutreten.";

export function buildInvitePath(roomId: number | string) {
  return `/invite/${roomId}`;
}

export function buildInviteUrl(roomId: number | string, origin = typeof window !== "undefined" ? window.location.origin : DEFAULT_APP_ORIGIN) {
  return new URL(buildInvitePath(roomId), origin).toString();
}

export function buildInviteAuthUrl(route: "/auth/login" | "/auth/register", roomId: number | string) {
  const searchParams = new URLSearchParams({
    m: INVITE_LOGIN_MESSAGE,
    redirectTo: buildInvitePath(roomId),
  });

  return `${route}?${searchParams.toString()}`;
}

export function buildAuthRedirectUrl(route: "/auth/login" | "/auth/register", redirectTo: string, message = GENERIC_LOGIN_MESSAGE) {
  const searchParams = new URLSearchParams({
    m: message,
    redirectTo,
  });

  return `${route}?${searchParams.toString()}`;
}

export function normalizeInternalRedirect(target: string | null, fallback = "/") {
  if (!target || !target.startsWith("/")) {
    return fallback;
  }

  return target;
}

export function parseInviteRoomId(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const candidates = [trimmed];

  try {
    const parsed = new URL(trimmed, DEFAULT_APP_ORIGIN);
    candidates.push(parsed.pathname, parsed.search);
  } catch {
    // Ignore values that are not valid URLs and fall back to regex parsing.
  }

  for (const candidate of candidates) {
    const inviteMatch = candidate.match(/\/invite\/(\d+)(?:[/?#]|$)/i);
    if (inviteMatch?.[1]) {
      return Number(inviteMatch[1]);
    }

    const ridMatch = candidate.match(/[?&]rid=(\d+)(?:&|$)/i);
    if (ridMatch?.[1]) {
      return Number(ridMatch[1]);
    }

    const roomMatch = candidate.match(/\/room\/(\d+)(?:[/?#]|$)/i);
    if (roomMatch?.[1]) {
      return Number(roomMatch[1]);
    }
  }

  return null;
}