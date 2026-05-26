export const GENERIC_LOGIN_MESSAGE = "Du musst eingeloggt sein, um auf diese Seite zuzugreifen.";

export function getAuthLoginMessage(redirectTo: string) {
  return redirectTo.startsWith("/invite/")
    ? "Zuerst einloggen oder registrieren, um Raum beizutreten."
    : GENERIC_LOGIN_MESSAGE;
}