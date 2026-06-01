import { describe, it, expect } from 'vitest'
import { getAuthLoginReason, getAuthLoginMessage, AUTH_LOGIN_REASONS, GENERIC_LOGIN_MESSAGE, INVITE_LOGIN_MESSAGE } from './authMessages'

describe('authMessages', () => {
  describe('getAuthLoginReason', () => {
    it('should return inviteJoin reason for invite paths', () => {
      expect(getAuthLoginReason('/invite/123')).toBe(AUTH_LOGIN_REASONS.inviteJoin)
    })

    it('should return generic reason for other paths', () => {
      expect(getAuthLoginReason('/room/123')).toBe(AUTH_LOGIN_REASONS.generic)
      expect(getAuthLoginReason('/')).toBe(AUTH_LOGIN_REASONS.generic)
    })
  })

  describe('getAuthLoginMessage', () => {
    it('should return INVITE_LOGIN_MESSAGE for inviteJoin reason', () => {
      expect(getAuthLoginMessage(AUTH_LOGIN_REASONS.inviteJoin)).toBe(INVITE_LOGIN_MESSAGE)
    })

    it('should return GENERIC_LOGIN_MESSAGE for generic reason', () => {
      expect(getAuthLoginMessage(AUTH_LOGIN_REASONS.generic)).toBe(GENERIC_LOGIN_MESSAGE)
    })

    it('should return GENERIC_LOGIN_MESSAGE by default', () => {
      expect(getAuthLoginMessage()).toBe(GENERIC_LOGIN_MESSAGE)
    })
  })
})
