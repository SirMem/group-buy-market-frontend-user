import { AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_STORAGE_KEY } from '../store/auth'

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}))

vi.mock('../router', () => ({
  default: {
    currentRoute: {
      value: {
        path: '/orders',
      },
    },
    replace: replaceMock,
  },
}))

import payHttp from './pay'

describe('pay request client', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceMock.mockReset()
  })

  it('injects bearer token from user_auth_info storage', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'pay-token',
        userId: '1001',
        username: 'tester',
        loginType: 'account',
      }),
    )

    const interceptor = payHttp.interceptors.request.handlers?.[0]?.fulfilled
    expect(interceptor).toBeTypeOf('function')

    const config = await interceptor!({
      headers: new AxiosHeaders(),
      data: { foo: 'bar' },
    } as any)

    expect(config.headers.get('Authorization')).toBe('Bearer pay-token')
    expect(config.headers.get('Accept')).toBe('application/json')
    expect(config.headers.get('Content-Type')).toBe('application/json')
  })

  it('clears auth storage and redirects to /login on 401', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'pay-token',
        userId: '1001',
        username: 'tester',
        loginType: 'account',
      }),
    )

    const interceptor = payHttp.interceptors.response.handlers?.[0]?.rejected
    expect(interceptor).toBeTypeOf('function')

    await expect(interceptor!({ response: { status: 401 } })).rejects.toEqual({ response: { status: 401 } })

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(replaceMock).toHaveBeenCalledWith('/login')
  })
})
