import { describe, expect, it } from "vitest";
import {
  INVITE_LOGIN_MESSAGE,
  buildAuthRedirectUrl,
  buildInviteAuthUrl,
  buildInvitePath,
  buildInviteUrl,
  normalizeInternalRedirect,
  parseInviteRoomId,
} from "./invite";
import { GENERIC_LOGIN_MESSAGE, getAuthLoginMessage } from "./authMessages";

describe("invite helpers", () => {
  it("parses invite links and query strings", () => {
    expect(parseInviteRoomId("123")).toBe(123);
    expect(parseInviteRoomId("https://example.com/invite/123")).toBe(123);
    expect(parseInviteRoomId("/invite/123")).toBe(123);
    expect(parseInviteRoomId("https://example.com/invite?rid=123")).toBe(123);
    expect(parseInviteRoomId("https://example.com/room/123")).toBe(123);
  });

  it("builds invite urls and auth redirects", () => {
    expect(buildInvitePath(123)).toBe("/invite/123");
    expect(buildInviteUrl(123, "https://game.example.com")).toBe("https://game.example.com/invite/123");
    expect(buildInviteAuthUrl("/auth/login", 123)).toContain("redirectTo=%2Finvite%2F123");
    expect(getAuthLoginMessage("/invite/123")).toBe(INVITE_LOGIN_MESSAGE);
    expect(getAuthLoginMessage("/settings")).toBe(GENERIC_LOGIN_MESSAGE);
    expect(buildAuthRedirectUrl("/auth/login", "/settings")).toContain(
      "m=Du+musst+eingeloggt+sein%2C+um+auf+diese+Seite+zuzugreifen."
    );
  });

  it("keeps only internal redirect targets", () => {
    expect(normalizeInternalRedirect("/invite/123")).toBe("/invite/123");
    expect(normalizeInternalRedirect("https://example.com")).toBe("/");
    expect(normalizeInternalRedirect(null)).toBe("/");
  });
});