import { AUTH_LOGIN_REASONS, type AuthLoginReason } from "@/lib/authMessages";

const DEFAULT_APP_ORIGIN = "http://localhost:3000";

export function buildInvitePath(roomId: number | string) {
  return `/invite/${roomId}`;
}

export function buildInviteUrl(roomId: number | string, origin = typeof window !== "undefined" ? window.location.origin : DEFAULT_APP_ORIGIN) {
  return new URL(buildInvitePath(roomId), origin).toString();
}

export function buildInviteAuthUrl(route: "/auth/login" | "/auth/register", roomId: number | string) {
  return buildAuthRedirectUrl(route, buildInvitePath(roomId), AUTH_LOGIN_REASONS.inviteJoin);
}

export function buildAuthRedirectUrl(route: "/auth/login" | "/auth/register", redirectTo: string, reason: AuthLoginReason = AUTH_LOGIN_REASONS.generic) {
  const searchParams = new URLSearchParams({
    reason,
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