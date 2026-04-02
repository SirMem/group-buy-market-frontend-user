import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { getStoredAuth, AUTH_STORAGE_KEY } from '../store/auth'

const routes = [
  { path: '/', component: { template: '<div>home</div>' }, meta: { title: '首页', requiresAuth: true } },
  { path: '/login', component: { template: '<div>login</div>' }, meta: { title: '登录' } },
  { path: '/orders', component: { template: '<div>orders</div>' }, meta: { title: '订单', requiresAuth: true } },
  { path: '/profile', component: { template: '<div>profile</div>' }, meta: { title: '我的', requiresAuth: true } },
]

function buildRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  router.beforeEach((to, _from, next) => {
    const auth = getStoredAuth()

    if (to.meta?.requiresAuth && !auth?.token) {
      next({ path: '/login', replace: true })
      return
    }

    if (to.path === '/login' && auth?.token) {
      next({ path: '/', replace: true })
      return
    }

    next()
  })

  return router
}

async function navigate(router: ReturnType<typeof buildRouter>, path: string) {
  await router.push(path)
  await router.isReady()
}

describe('router auth guards', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects protected routes to /login when no stored token exists', async () => {
    const router = buildRouter()

    await navigate(router, '/profile')

    expect(router.currentRoute.value.fullPath).toBe('/login')
  })

  it('allows authenticated users to access protected routes', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'stored-token',
        userId: '1001',
        username: 'tester',
        loginType: 'account',
      }),
    )

    const router = buildRouter()
    await navigate(router, '/orders')

    expect(router.currentRoute.value.fullPath).toBe('/orders')
  })

  it('redirects authenticated users away from /login to /', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'stored-token',
        userId: '1001',
        username: 'tester',
        loginType: 'account',
      }),
    )

    const router = buildRouter()
    await navigate(router, '/login')

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('re-locks protected routes after auth is cleared', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: 'stored-token',
        userId: '1001',
        username: 'tester',
        loginType: 'account',
      }),
    )

    const router = buildRouter()
    await navigate(router, '/profile')
    expect(router.currentRoute.value.fullPath).toBe('/profile')

    localStorage.removeItem(AUTH_STORAGE_KEY)

    await navigate(router, '/orders')

    expect(router.currentRoute.value.fullPath).toBe('/login')
  })
})
