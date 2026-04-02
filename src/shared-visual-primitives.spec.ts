import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GoodsCard from './components/GoodsCard.vue'

describe('Sirmem shared visual primitives', () => {
  it('renders goods cards with the shared surface and placeholder media shell', () => {
    const wrapper = mount(GoodsCard, {
      props: {
        goods: {
          activityId: 1001,
          goodsId: 'G-1001',
          goodsName: 'Sirmem 护肤套装',
          payPrice: 89,
          originalPrice: 129,
          deductionPrice: 40,
          visible: true,
          enable: true,
          effective: true,
          teamStatistic: {
            allTeamCount: 12,
            allTeamCompleteCount: 8,
            allTeamUserCount: 36,
          },
          inventory: {
            totalStock: 120,
            reservedStock: 12,
            soldStock: 20,
            availableStock: 88,
          },
        },
      },
    })

    expect(wrapper.classes()).toContain('sirmem-surface-card')
    expect(wrapper.classes()).toContain('sirmem-goods-card')
    expect(wrapper.find('.sirmem-placeholder-media').exists()).toBe(true)
    expect(wrapper.find('.sirmem-goods-card__headline').text()).toContain('Sirmem 护肤套装')
    expect(wrapper.text()).toContain('¥89')
    expect(wrapper.text()).toContain('¥129')
    expect(wrapper.text()).toContain('立省 ¥40')
    expect(wrapper.find('.sirmem-goods-card__badge-note').text()).toContain('预留真实商品图')
    expect(wrapper.find('.sirmem-goods-card__progress-fill').attributes('style')).toContain('width')
  })
})
