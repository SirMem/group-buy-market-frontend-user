import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App.vue'

const bottomNavStub = { template: '<nav data-testid="bottom-nav">nav</nav>' }

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: { template: '<div data-testid="route-view">home</div>' },
        meta: { tabbar: true },
      },
      {
        path: '/login',
        component: { template: '<div data-testid="route-view">login</div>' },
        meta: { tabbar: false },
      },
    ],
  })
}

describe('Sirmem visual foundation shell', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders routed content without bottom nav on routes outside the tab shell', async () => {
    const router = createTestRouter()

    router.push('/login')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          BottomNav: bottomNavStub,
        },
      },
    })

    expect(wrapper.classes()).toContain('sirmem-app-shell')
    expect(wrapper.find('main').classes()).toContain('sirmem-page-shell')
    expect(wrapper.find('[data-testid="route-view"]').text()).toBe('login')
    expect(wrapper.find('[data-testid="bottom-nav"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="bottom-nav-spacer"]').exists()).toBe(false)
  })

  it('renders bottom nav and layout spacer on routes inside the tab shell', async () => {
    const router = createTestRouter()

    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          BottomNav: bottomNavStub,
        },
      },
    })

    expect(wrapper.find('[data-testid="route-view"]').text()).toBe('home')
    expect(wrapper.find('[data-testid="bottom-nav"]').exists()).toBe(true)

    const spacer = wrapper.find('[data-testid="bottom-nav-spacer"]')
    expect(spacer.exists()).toBe(true)
    expect(spacer.classes()).toContain('sirmem-bottom-nav-spacer')
  })
})


