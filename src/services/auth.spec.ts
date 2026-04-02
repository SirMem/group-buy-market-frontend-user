import { describe, expect, it } from 'vitest'
import { normalizeAuthResponse, toAccountAuthState } from './auth'

describe('normalizeAuthResponse', () => {
  const base = {
    id: 1,
    username: 'tester',
    role: 'user',
    userStatus: 1,
  }

  it('keeps token when token is present', () => {
    expect(normalizeAuthResponse({ ...base, token: 'token-value' })).toEqual({
      ...base,
      token: 'token-value',
    })
  })

  it('falls back to jwtToken when token is missing', () => {
    expect(normalizeAuthResponse({ ...base, jwtToken: 'jwt-token' })).toEqual({
      ...base,
      jwtToken: 'jwt-token',
      token: 'jwt-token',
    })
  })

  it('prefers token when both token and jwtToken are present', () => {
    expect(normalizeAuthResponse({ ...base, token: 'token-value', jwtToken: 'jwt-token' })).toEqual({
      ...base,
      token: 'token-value',
      jwtToken: 'jwt-token',
    })
  })

  it('returns null when neither token field exists', () => {
    expect(normalizeAuthResponse(base)).toBeNull()
  })
})

describe('toAccountAuthState', () => {
  it('maps normalized auth into account auth state', () => {
    expect(
      toAccountAuthState(
        {
          id: 1,
          username: 'tester',
          role: 'user',
          userStatus: 1,
          token: 'token-value',
        },
        'fallback-user',
      ),
    ).toEqual({
      token: 'token-value',
      userId: '1',
      username: 'tester',
    })
  })

  it('maps backend id to string userId while preserving normalized token', () => {
    expect(
      toAccountAuthState(
        {
          id: 99,
          username: 'member-99',
          role: 'user',
          userStatus: 1,
          token: 'normalized-token',
          jwtToken: 'legacy-token',
        },
        'fallback-user',
      ),
    ).toEqual({
      token: 'normalized-token',
      userId: '99',
      username: 'member-99',
    })
  })

  it('uses fallback username when normalized auth username is empty', () => {
    expect(
      toAccountAuthState(
        {
          id: 1,
          username: '',
          role: 'user',
          userStatus: 1,
          token: 'token-value',
        },
        'fallback-user',
      ),
    ).toEqual({
      token: 'token-value',
      userId: '1',
      username: 'fallback-user',
    })
  })

  it('returns null when normalized auth is missing', () => {
    expect(toAccountAuthState(null, 'fallback-user')).toBeNull()
  })
})
