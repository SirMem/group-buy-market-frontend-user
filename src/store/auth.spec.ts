import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { AUTH_STORAGE_KEY, getStoredAuth, useAuthStore } from './auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('persists account auth using the unified storage key', () => {
    const store = useAuthStore()

    store.setAccountAuth({
      token: 'account-token',
      userId: '1001',
      username: 'tester',
    })

    expect(getStoredAuth()).toEqual({
      token: 'account-token',
      userId: '1001',
      username: 'tester',
      loginType: 'account',
    })
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe(
      JSON.stringify({
        token: 'account-token',
        userId: '1001',
        username: 'tester',
        loginType: 'account',
      }),
    )
  })

  it('hydrates store state from persisted auth', () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'hydrated-token',
        userId: '2002',
        username: 'hydrated-user',
        loginType: 'account',
      }),
    )

    const store = useAuthStore()
    store.hydrate()

    expect(store.token).toBe('hydrated-token')
    expect(store.userId).toBe('2002')
    expect(store.username).toBe('hydrated-user')
    expect(store.loginType).toBe('account')
    expect(store.isAuthenticated).toBe(true)
  })

  it('clears in-memory state and user_auth_info storage', () => {
    const store = useAuthStore()
    store.setAccountAuth({
      token: 'account-token',
      userId: '1001',
      username: 'tester',
    })

    store.clear()

    expect(store.token).toBe('')
    expect(store.userId).toBe('')
    expect(store.username).toBe('')
    expect(store.loginType).toBe('account')
    expect(store.isAuthenticated).toBe(false)
    expect(getStoredAuth()).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })
})
