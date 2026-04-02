import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  pushMock,
  queryMarketGoodsPageMock,
  querySourceListMock,
  queryChannelListBySourceMock,
  messageErrorMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  queryMarketGoodsPageMock: vi.fn(),
  querySourceListMock: vi.fn(),
  queryChannelListBySourceMock: vi.fn(),
  messageErrorMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('../../services/goods', () => ({
  queryMarketGoodsPage: queryMarketGoodsPageMock,
  querySourceList: querySourceListMock,
  queryChannelListBySource: queryChannelListBySourceMock,
}))

vi.mock('element-plus', async () => {
  const actual = await vi.importActual<typeof import('element-plus')>('element-plus')
  return {
    ...actual,
    ElMessage: {
      error: messageErrorMock,
    },
  }
})

import HomePage from './index.vue'
import { useAuthStore } from '../../store/auth'

const goodsFixture = {
  activityId: 1001,
  goodsId: 'G-1001',
  goodsName: 'Sirmem 活动护肤套装',
  payPrice: 89,
  originalPrice: 129,
  deductionPrice: 40,
  visible: true,
  enable: true,
  effective: true,
  teamStatistic: {
    allTeamCount: 5,
    allTeamCompleteCount: 2,
    allTeamUserCount: 18,
  },
  inventory: {
    totalStock: 60,
    reservedStock: 6,
    soldStock: 10,
    availableStock: 44,
  },
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

async function mountHomePage() {
  const wrapper = mount(HomePage)
  await flushPromises()
  await nextTick()
  return wrapper
}

describe('HomePage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()

    const authStore = useAuthStore()
    authStore.setAccountAuth({
      token: 'token-1',
      userId: 'user-1001',
      username: 'Sirmem Tester',
    })

    pushMock.mockReset()
    queryMarketGoodsPageMock.mockReset()
    querySourceListMock.mockReset()
    queryChannelListBySourceMock.mockReset()
    messageErrorMock.mockReset()

    queryMarketGoodsPageMock.mockResolvedValue({
      code: '0000',
      info: 'success',
      data: {
        total: 1,
        list: [goodsFixture],
      },
    })

    querySourceListMock.mockResolvedValue({
      code: '0000',
      info: 'success',
      data: ['s01', 's02'],
    })

    queryChannelListBySourceMock.mockResolvedValue({
      code: '0000',
      info: 'success',
      data: ['c01', 'c02'],
    })
  })

  it('在 onMounted 时拉取第一页商品，默认不带 source 和 channel', async () => {
    const wrapper = await mountHomePage()

    expect(queryMarketGoodsPageMock).toHaveBeenCalledTimes(1)
    expect(queryMarketGoodsPageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1001',
        source: undefined,
        channel: undefined,
        page: 1,
        pageSize: 10,
      }),
    )
    expect(wrapper.text()).toContain('Sirmem 活动护肤套装')
  })

  it('source 首次展开时才请求来源列表', async () => {
    const wrapper = await mountHomePage()

    expect(querySourceListMock).not.toHaveBeenCalled()

    const button = wrapper.findAll('button').find((item) => item.text().includes('全部来源'))
    expect(button).toBeTruthy()
    await button!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(querySourceListMock).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('s01')
    expect(wrapper.text()).toContain('s02')
  })

  it('source 变化时重置 channel、加载渠道并刷新商品', async () => {
    const wrapper = await mountHomePage()

    const sourceButton = wrapper.findAll('button').find((item) => item.text().includes('全部来源'))
    await sourceButton!.trigger('click')
    await flushPromises()
    await nextTick()

    queryMarketGoodsPageMock.mockClear()

    const sourceOption = wrapper.findAll('button').find((item) => item.text() === 's01')
    expect(sourceOption).toBeTruthy()
    await sourceOption!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(queryChannelListBySourceMock).toHaveBeenCalledTimes(1)
    expect(queryChannelListBySourceMock).toHaveBeenCalledWith('s01')
    expect(queryMarketGoodsPageMock).toHaveBeenCalledTimes(1)
    expect(queryMarketGoodsPageMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        source: 's01',
        channel: undefined,
      }),
    )

    const channelButton = wrapper.findAll('button').find((item) => item.text().includes('全部渠道'))
    expect(channelButton).toBeTruthy()
    await channelButton!.trigger('click')
    await flushPromises()
    await nextTick()

    queryMarketGoodsPageMock.mockClear()

    const channelOption = wrapper.findAll('button').find((item) => item.text() === 'c01')
    expect(channelOption).toBeTruthy()
    await channelOption!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(queryMarketGoodsPageMock).toHaveBeenCalledTimes(1)
    expect(queryMarketGoodsPageMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        source: 's01',
        channel: 'c01',
      }),
    )
  })

  it('source 为空时不会发送 channel-only 非法请求', async () => {
    const wrapper = await mountHomePage()

    expect(wrapper.text()).toContain('请选择来源')

    const channelButton = wrapper.findAll('button').find((item) => item.text().includes('请选择来源'))
    expect(channelButton).toBeTruthy()
    await channelButton!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(queryChannelListBySourceMock).not.toHaveBeenCalled()

    queryMarketGoodsPageMock.mockClear()

    const sourceButton = wrapper.findAll('button').find((item) => item.text().includes('全部来源'))
    await sourceButton!.trigger('click')
    await flushPromises()
    await nextTick()

    const allSourceOption = wrapper.findAll('button').find((item) => item.text() === '全部来源')
    expect(allSourceOption).toBeTruthy()
    await allSourceOption!.trigger('click')
    await flushPromises()
    await nextTick()

    expect(queryMarketGoodsPageMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        source: undefined,
        channel: expect.any(String),
      }),
    )
  })
})
