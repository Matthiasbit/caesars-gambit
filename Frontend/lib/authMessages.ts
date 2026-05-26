export const AUTH_LOGIN_REASONS = {
  generic: "auth-required",
  inviteJoin: "invite-join",
} as const;

export type AuthLoginReason = (typeof AUTH_LOGIN_REASONS)[keyof typeof AUTH_LOGIN_REASONS];

export const GENERIC_LOGIN_MESSAGE = "Du musst eingeloggt sein, um auf diese Seite zuzugreifen.";
export const INVITE_LOGIN_MESSAGE = "Zuerst einloggen oder registrieren, um Raum beizutreten.";

export function getAuthLoginReason(redirectTo: string): AuthLoginReason {
  return redirectTo.startsWith("/invite/")
    ? AUTH_LOGIN_REASONS.inviteJoin
    : AUTH_LOGIN_REASONS.generic;
}

export function getAuthLoginMessage(reason: AuthLoginReason = AUTH_LOGIN_REASONS.generic) {
  return reason === AUTH_LOGIN_REASONS.inviteJoin
    ? INVITE_LOGIN_MESSAGE
    : GENERIC_LOGIN_MESSAGE;
}