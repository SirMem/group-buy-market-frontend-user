import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderCard from './OrderCard.vue'

describe('OrderCard', () => {
  it('renders required backend fields', () => {
    const wrapper = mount(OrderCard, {
      props: {
        productName: 'Sirmem 护肤礼盒',
        orderId: 'ORDER-1001',
        statusDetail: 'PAY_WAIT',
        totalAmount: 129,
      },
    })

    expect(wrapper.text()).toContain('Sirmem 护肤礼盒')
    expect(wrapper.text()).toContain('Order #ORDER-1001')
    expect(wrapper.text()).toContain('PAY_WAIT')
    expect(wrapper.text()).toContain('¥129.00')
  })

  it('falls back to default image', () => {
    const wrapper = mount(OrderCard, {
      props: {
        productName: 'Sirmem 护肤礼盒',
        orderId: 'ORDER-1001',
        statusDetail: 'PAY_WAIT',
        totalAmount: 129,
      },
    })

    expect(wrapper.find('img').attributes('src')).toContain('data:image/svg+xml')
  })

  it('formats numeric amount', () => {
    const wrapper = mount(OrderCard, {
      props: {
        productName: 'Sirmem 护肤礼盒',
        orderId: 'ORDER-1002',
        statusDetail: 'PAY_SUCCESS',
        totalAmount: '88',
      },
    })

    expect(wrapper.text()).toContain('¥88.00')
  })
})
