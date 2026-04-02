import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  replaceMock,
  loginMock,
  registerMock,
  toAccountAuthStateMock,
  getWeixinTicketMock,
  checkLoginMock,
  messageSuccessMock,
  messageErrorMock,
  messageWarningMock,
} = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  loginMock: vi.fn(),
  registerMock: vi.fn(),
  toAccountAuthStateMock: vi.fn(),
  getWeixinTicketMock: vi.fn(),
  checkLoginMock: vi.fn(),
  messageSuccessMock: vi.fn(),
  messageErrorMock: vi.fn(),
  messageWarningMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}))

vi.mock('../../services/auth', () => ({
  login: loginMock,
  register: registerMock,
  toAccountAuthState: toAccountAuthStateMock,
  getWeixinTicket: getWeixinTicketMock,
  checkLogin: checkLoginMock,
}))

vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof import('element-plus')>('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: messageSuccessMock,
      error: messageErrorMock,
      warning: messageWarningMock,
    },
  }
})

import LoginPage from './index.vue'
import { AUTH_STORAGE_KEY, useAuthStore } from '../../store/auth'

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

async function mountLoginPage() {
  const wrapper = mount(LoginPage, {
    global: {
      stubs: {
        'el-form': {
          template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>',
        },
        'el-form-item': {
          template: '<label><slot /></label>',
        },
        'el-input': {
          props: ['modelValue', 'placeholder', 'type', 'size'],
          emits: ['update:modelValue', 'keyup.enter'],
          template:
            '<input :value="modelValue" :placeholder="placeholder" :type="type || \'text\'" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup.enter\')" />',
        },
        'el-button': {
          template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>',
        },
        'el-skeleton': {
          template: '<div data-testid="wechat-skeleton"><slot name="template" /></div>',
        },
      },
    },
  })

  await nextTick()
  return wrapper
}

async function switchToAccountTab(wrapper: Awaited<ReturnType<typeof mountLoginPage>>) {
  const accountTab = wrapper.findAll('button').find((item) => item.text().includes('Account Login'))
  expect(accountTab).toBeTruthy()
  await accountTab!.trigger('click')
  await nextTick()
}

describe('LoginPage account flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    replaceMock.mockReset()
    loginMock.mockReset()
    registerMock.mockReset()
    toAccountAuthStateMock.mockReset()
    getWeixinTicketMock.mockReset()
    checkLoginMock.mockReset()
    messageSuccessMock.mockReset()
    messageErrorMock.mockReset()
    messageWarningMock.mockReset()
    getWeixinTicketMock.mockResolvedValue({ code: '0000', info: 'success', data: 'ticket-1' })
  })

  it('persists account auth and redirects home after successful login', async () => {
    loginMock.mockResolvedValue({
      code: 200,
      info: 'ok',
      data: { token: 'normalized-token', id: 1, username: 'alice' },
    })
    toAccountAuthStateMock.mockReturnValue({
      token: 'normalized-token',
      userId: '1',
      username: 'alice',
    })

    const wrapper = await mountLoginPage()
    await switchToAccountTab(wrapper)

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('alice')
    await inputs[1].setValue('secret')

    const submitButton = wrapper.findAll('button').find((item) => item.text() === '立即登录')
    await submitButton!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(loginMock).toHaveBeenCalledWith({ username: 'alice', password: 'secret' })
    expect(toAccountAuthStateMock).toHaveBeenCalledWith({ token: 'normalized-token', id: 1, username: 'alice' }, 'alice')
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe(
      JSON.stringify({
        token: 'normalized-token',
        userId: '1',
        username: 'alice',
        loginType: 'account',
      }),
    )
    expect(replaceMock).toHaveBeenCalledWith('/')
    expect(messageSuccessMock).toHaveBeenCalledWith('登录成功')
  })

  it('persists account auth and redirects home after successful register', async () => {
    registerMock.mockResolvedValue({
      code: 200,
      info: 'ok',
      data: { token: 'registered-token', id: 2, username: 'new-user' },
    })
    toAccountAuthStateMock.mockReturnValue({
      token: 'registered-token',
      userId: '2',
      username: 'new-user',
    })

    const wrapper = await mountLoginPage()
    await switchToAccountTab(wrapper)
    const toggleButton = wrapper.findAll('button').find((item) => item.text() === '去注册')
    await toggleButton!.trigger('click')
    await nextTick()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('new-user')
    await inputs[1].setValue('secret')

    const submitButton = wrapper.findAll('button').find((item) => item.text() === '注册并登录')
    await submitButton!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(registerMock).toHaveBeenCalledWith({ username: 'new-user', password: 'secret' })
    expect(toAccountAuthStateMock).toHaveBeenCalledWith({ token: 'registered-token', id: 2, username: 'new-user' }, 'new-user')
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBe(
      JSON.stringify({
        token: 'registered-token',
        userId: '2',
        username: 'new-user',
        loginType: 'account',
      }),
    )
    expect(replaceMock).toHaveBeenCalledWith('/')
    expect(messageSuccessMock).toHaveBeenCalledWith('注册成功，已自动登录')
  })

  it('does not persist auth or redirect when login fails', async () => {
    loginMock.mockResolvedValue({
      code: 500,
      info: '用户名或密码错误',
      data: null,
    })
    toAccountAuthStateMock.mockReturnValue(null)

    const wrapper = await mountLoginPage()
    await switchToAccountTab(wrapper)

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('alice')
    await inputs[1].setValue('bad-password')

    const submitButton = wrapper.findAll('button').find((item) => item.text() === '立即登录')
    await submitButton!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(loginMock).toHaveBeenCalledWith({ username: 'alice', password: 'bad-password' })
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(replaceMock).not.toHaveBeenCalled()
    expect(messageErrorMock).toHaveBeenCalledWith('用户名或密码错误')
    expect(useAuthStore().isAuthenticated).toBe(false)
  })

  it('shows centered wechat qrcode area by default', async () => {
    const wrapper = await mountLoginPage()
    await flushPromises()
    await nextTick()

    expect(getWeixinTicketMock).toHaveBeenCalled()
    expect(wrapper.text()).toContain('WeChat login')
    expect(wrapper.text()).toContain('请使用微信扫码关注测试平台后完成登录')

    const qrImage = wrapper.find('[data-testid="wechat-qrcode"]')
    expect(qrImage.exists()).toBe(true)
    expect(qrImage.attributes('src')).toContain(encodeURIComponent('ticket-1'))
  })
})
