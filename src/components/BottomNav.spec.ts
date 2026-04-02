import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import BottomNav from './BottomNav.vue'

function createTestRouter(initialPath = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>home</div>' } },
      { path: '/orders', component: { template: '<div>orders</div>' } },
      { path: '/orders/:id', component: { template: '<div>order detail</div>' } },
      { path: '/profile', component: { template: '<div>profile</div>' } },
      { path: '/profile/settings', component: { template: '<div>settings</div>' } },
    ],
  })

  return { router, initialPath }
}

describe('BottomNav', () => {
  it('renders the three branded tabs and marks the active route', async () => {
    const { router, initialPath } = createTestRouter('/orders')
    router.push(initialPath)
    await router.isReady()

    const wrapper = mount(BottomNav, {
      global: {
        plugins: [router],
      },
    })

    const items = wrapper.findAll('.sirmem-bottom-nav__item')
    expect(items).toHaveLength(3)
    expect(items.map((item) => item.find('span:last-child').text())).toEqual(['首页', '订单', '我的'])
    expect(wrapper.findAll('.sirmem-bottom-nav__icon')).toHaveLength(3)

    expect(items[0].attributes('aria-current')).toBeUndefined()
    expect(items[1].attributes('aria-current')).toBe('page')
    expect(items[1].classes()).toContain('is-active')
    expect(items[2].attributes('aria-current')).toBeUndefined()
  })

  it('keeps the parent tab active on nested tab routes', async () => {
    const { router, initialPath } = createTestRouter('/orders/2026-issue-2')
    router.push(initialPath)
    await router.isReady()

    const wrapper = mount(BottomNav, {
      global: {
        plugins: [router],
      },
    })

    const items = wrapper.findAll('.sirmem-bottom-nav__item')
    expect(items[1].attributes('aria-current')).toBe('page')
    expect(items[1].classes()).toContain('is-active')
    expect(items[0].attributes('aria-current')).toBeUndefined()
  })

  it('navigates to another tab when an inactive item is clicked', async () => {
    const { router, initialPath } = createTestRouter('/')
    router.push(initialPath)
    await router.isReady()

    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(BottomNav, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.findAll('.sirmem-bottom-nav__item')[2].trigger('click')
    await nextTick()

    expect(pushSpy).toHaveBeenCalledWith('/profile')
  })

  it('keeps the current route when the active tab is clicked again', async () => {
    const { router, initialPath } = createTestRouter('/profile')
    router.push(initialPath)
    await router.isReady()

    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(BottomNav, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.findAll('.sirmem-bottom-nav__item')[2].trigger('click')
    await nextTick()

    expect(pushSpy).not.toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/profile')
    expect(wrapper.findAll('.sirmem-bottom-nav__item')[2].attributes('aria-current')).toBe('page')
  })
})



