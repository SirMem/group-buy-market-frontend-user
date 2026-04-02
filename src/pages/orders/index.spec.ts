import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { queryUserOrderListMock } = vi.hoisted(() => ({
  queryUserOrderListMock: vi.fn(),
}))

vi.mock('../../services/order', () => ({
  queryUserOrderList: queryUserOrderListMock,
}))

import OrdersPage from './index.vue'
import { useAuthStore } from '../../store/auth'

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

async function mountOrdersPage() {
  const wrapper = mount(OrdersPage, {
    global: {
      stubs: {
        OrderCard: {
          props: ['productName', 'orderId', 'statusDetail', 'totalAmount', 'productImage'],
          template:
            '<article data-testid="order-card"><h3>{{ productName }}</h3><span>{{ orderId }}</span><span>{{ statusDetail }}</span><span>{{ totalAmount }}</span></article>',
        },
      },
    },
  })

  await flushPromises()
  await nextTick()
  return wrapper
}

describe('OrdersPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    queryUserOrderListMock.mockReset()

    const authStore = useAuthStore()
    authStore.setAccountAuth({
      token: 'token-1',
      userId: 'user-1001',
      username: 'Sirmem Tester',
    })
  })

  it('loads orders on mount and renders cards', async () => {
    queryUserOrderListMock.mockResolvedValue({
      code: '0000',
      info: 'success',
      data: {
        orderList: [
          {
            id: 1,
            userId: 'user-1001',
            productId: 'goods-1',
            productName: 'Sirmem 护肤礼盒',
            orderId: 'ORDER-1001',
            orderTime: '2026-04-01 10:00:00',
            totalAmount: 129,
            status: 'PAY_WAIT',
            payUrl: '',
            marketType: 1,
            marketDeductionAmount: 0,
            payAmount: 129,
            payTime: '',
          },
        ],
        hasMore: false,
        lastId: 1,
      },
    })

    const wrapper = await mountOrdersPage()

    expect(queryUserOrderListMock).toHaveBeenCalledWith({
      userId: 'user-1001',
      lastId: null,
      pageSize: 10,
    })
    expect(wrapper.findAll('[data-testid="order-card"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('Sirmem 护肤礼盒')
    expect(wrapper.text()).toContain('ORDER-1001')
    expect(wrapper.text()).toContain('PAY_WAIT')
  })

  it('renders empty state when no orders are returned', async () => {
    queryUserOrderListMock.mockResolvedValue({
      code: '0000',
      info: 'success',
      data: {
        orderList: [],
        hasMore: false,
        lastId: null,
      },
    })

    const wrapper = await mountOrdersPage()

    expect(wrapper.text()).toContain('No orders yet.')
  })

  it('renders load more button when hasMore is true', async () => {
    queryUserOrderListMock.mockResolvedValue({
      code: '0000',
      info: 'success',
      data: {
        orderList: [
          {
            id: 1,
            userId: 'user-1001',
            productId: 'goods-1',
            productName: 'Sirmem 护肤礼盒',
            orderId: 'ORDER-1001',
            orderTime: '2026-04-01 10:00:00',
            totalAmount: 129,
            status: 'PAY_WAIT',
            payUrl: '',
            marketType: 1,
            marketDeductionAmount: 0,
            payAmount: 129,
            payTime: '',
          },
        ],
        hasMore: true,
        lastId: 1,
      },
    })

    const wrapper = await mountOrdersPage()

    expect(wrapper.text()).toContain('Load more')
  })

  it('renders error message when query fails', async () => {
    queryUserOrderListMock.mockRejectedValue(new Error('network down'))

    const wrapper = await mountOrdersPage()

    expect(wrapper.text()).toContain('network down')
  })
})
