import gbmHttp from '../request/gbm'
import payHttp from '../request/pay'

export interface AuthRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token?: string
  jwtToken?: string
  id: number
  username: string
  role: string
  userStatus: number
}

export interface NormalizedAuthResponse extends Omit<AuthResponse, 'token'> {
  token: string
}

export interface AccountAuthState {
  token: string
  userId: string
  username: string
}

export interface ApiResult<T> {
  code: number | string
  info: string
  data: T
}

export function normalizeAuthResponse(data?: AuthResponse | null): NormalizedAuthResponse | null {
  if (!data) return null

  const token = data.token || data.jwtToken
  if (!token) return null

  return {
    ...data,
    token,
  }
}

export function toAccountAuthState(data: NormalizedAuthResponse | null, fallbackUsername = ''): AccountAuthState | null {
  if (!data?.token) return null

  return {
    token: data.token,
    userId: String(data.id),
    username: data.username || fallbackUsername,
  }
}

export async function login(payload: AuthRequest) {
  const response = await gbmHttp.post<any, ApiResult<AuthResponse>>('/api/v1/auth/login', payload)
  return {
    ...response,
    data: normalizeAuthResponse(response.data),
  }
}

export async function register(payload: AuthRequest) {
  const response = await gbmHttp.post<any, ApiResult<AuthResponse>>('/api/v1/auth/register', payload)
  return {
    ...response,
    data: normalizeAuthResponse(response.data),
  }
}

export async function getWeixinTicket() {
  return payHttp.get<any, ApiResult<string>>('/api/v1/login/weixin_qrcode_ticket')
}

export async function checkLogin(ticket: string) {
  return payHttp.get<any, ApiResult<string>>('/api/v1/login/check_login', {
    params: { ticket },
  })
}
