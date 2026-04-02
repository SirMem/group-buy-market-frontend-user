<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  queryChannelListBySource,
  queryMarketGoodsPage,
  querySourceList,
  type MarketGoodsCardDTO,
} from '../../services/goods'
import { useAuthStore } from '../../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const pageSize = 10
const goodsList = ref<MarketGoodsCardDTO[]>([])
const loading = ref(false)
const total = ref(0)
const selectedSource = ref('')
const selectedChannel = ref('')
const sourceOptions = ref<string[]>([])
const channelOptions = ref<string[]>([])
const sourceOptionsLoaded = ref(false)
const channelOptionsLoadedFor = ref('')
const sourceMenuOpen = ref(false)
const channelMenuOpen = ref(false)
const sourceLoading = ref(false)
const channelLoading = ref(false)

const sourceLabel = computed(() => (selectedSource.value ? selectedSource.value : '全部来源'))
const channelLabel = computed(() => {
  if (!selectedSource.value) return '请选择来源'
  return selectedChannel.value || '全部渠道'
})
const hasGoods = computed(() => goodsList.value.length > 0)

function formatPrice(price?: number) {
  return `¥${Number(price ?? 0).toFixed(2)}`
}

function formatSaveAmount(goods: MarketGoodsCardDTO) {
  return `¥${Number(goods.deductionPrice ?? 0).toFixed(2)}`
}

function getProgress(goods: MarketGoodsCardDTO) {
  const joined = goods.teamStatistic?.allTeamUserCount ?? 0
  const totalCount = goods.inventory?.totalStock ?? 0
  if (!totalCount) return 0
  return Math.min(100, Math.round((joined / totalCount) * 100))
}

function getJoinedText(goods: MarketGoodsCardDTO) {
  const joined = goods.teamStatistic?.allTeamUserCount ?? 0
  const totalCount = goods.inventory?.totalStock ?? 0
  if (!totalCount) return `${joined} people joined`
  return `${joined}/${totalCount} people joined`
}

function getGoodsImage(goods: MarketGoodsCardDTO) {
  return `https://picsum.photos/seed/${encodeURIComponent(goods.goodsId)}/800/1000`
}

function buildGoodsRequest() {
  const source = selectedSource.value.trim()
  const channel = source ? selectedChannel.value.trim() : ''

  return {
    userId: authStore.userId,
    source: source || undefined,
    channel: channel || undefined,
    page: 1,
    pageSize,
    onlyEffective: true,
    includeInventory: true,
    includeTeamStatistic: true,
    includeTeamList: false,
  }
}

async function loadGoods() {
  if (!authStore.userId) return

  loading.value = true

  try {
    const response = await queryMarketGoodsPage(buildGoodsRequest())

    if (!(response.code === '0000' || response.code === 200)) {
      ElMessage.error(response.info || '商品加载失败')
      goodsList.value = []
      total.value = 0
      return
    }

    goodsList.value = response.data?.list ?? []
    total.value = response.data?.total ?? 0
  } catch (error: any) {
    goodsList.value = []
    total.value = 0
    const message = error?.response?.data?.info || error?.message || '商品加载失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

async function ensureSourceOptions() {
  if (sourceOptionsLoaded.value || sourceLoading.value) return

  sourceLoading.value = true
  try {
    const response = await querySourceList()
    if (!(response.code === '0000' || response.code === 200)) {
      ElMessage.error(response.info || '来源列表加载失败')
      return
    }
    sourceOptions.value = response.data ?? []
    sourceOptionsLoaded.value = true
  } catch (error: any) {
    const message = error?.response?.data?.info || error?.message || '来源列表加载失败'
    ElMessage.error(message)
  } finally {
    sourceLoading.value = false
  }
}

async function loadChannelOptions(source: string) {
  if (!source) {
    channelOptions.value = []
    channelOptionsLoadedFor.value = ''
    return
  }

  if (channelOptionsLoadedFor.value === source) return

  channelLoading.value = true
  try {
    const response = await queryChannelListBySource(source)
    if (!(response.code === '0000' || response.code === 200)) {
      ElMessage.error(response.info || '渠道列表加载失败')
      channelOptions.value = []
      channelOptionsLoadedFor.value = ''
      return
    }
    channelOptions.value = response.data ?? []
    channelOptionsLoadedFor.value = source
  } catch (error: any) {
    channelOptions.value = []
    channelOptionsLoadedFor.value = ''
    const message = error?.response?.data?.info || error?.message || '渠道列表加载失败'
    ElMessage.error(message)
  } finally {
    channelLoading.value = false
  }
}

async function toggleSourceMenu() {
  sourceMenuOpen.value = !sourceMenuOpen.value
  if (sourceMenuOpen.value) {
    channelMenuOpen.value = false
    await ensureSourceOptions()
  }
}

function toggleChannelMenu() {
  if (!selectedSource.value) return
  channelMenuOpen.value = !channelMenuOpen.value
  if (channelMenuOpen.value) {
    sourceMenuOpen.value = false
  }
}

async function selectSource(source: string) {
  const nextSource = source.trim()
  if (selectedSource.value === nextSource) {
    sourceMenuOpen.value = false
    return
  }

  selectedSource.value = nextSource
  selectedChannel.value = ''
  channelOptions.value = []
  channelOptionsLoadedFor.value = ''
  sourceMenuOpen.value = false
  channelMenuOpen.value = false

  if (nextSource) {
    await loadChannelOptions(nextSource)
  }

  await loadGoods()
}

async function selectChannel(channel: string) {
  const nextChannel = selectedSource.value ? channel.trim() : ''
  if (selectedChannel.value === nextChannel) {
    channelMenuOpen.value = false
    return
  }

  selectedChannel.value = nextChannel
  channelMenuOpen.value = false
  await loadGoods()
}

function openGoodsDetail(goodsId: string) {
  router.push(`/goods/${goodsId}`)
}

onMounted(() => {
  void loadGoods()
})
</script>

<template>
  <div class="min-h-screen bg-[#f6f6f6] text-[#2d2f2f] font-sans pb-24 font-[Be_Vietnam_Pro]">
    <header class="bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-all">
      <div class="flex justify-between items-center w-full px-6 py-3">
        <div class="flex items-center gap-4">
          <button class="hover:opacity-80 transition-opacity active:scale-95 duration-200">
            <span class="material-symbols-outlined text-[#b61323]">menu</span>
          </button>
          <h1 class="text-2xl font-black italic tracking-tighter text-[#b61323] font-[Plus_Jakarta_Sans]">Sirmem</h1>
        </div>

        <div class="flex items-center gap-4">
          <button class="hover:opacity-80 transition-opacity active:scale-95 duration-200">
            <span class="material-symbols-outlined text-[#b61323]">shopping_bag</span>
          </button>
        </div>
      </div>
      <div class="bg-zinc-200 h-[1px] w-full"></div>
    </header>

    <main class="max-w-7xl mx-auto">
      <section class="px-6 pt-6 pb-10">
        <div class="relative overflow-hidden rounded-3xl bg-[#b61323] aspect-[21/9] md:aspect-[21/7] flex items-center shadow-2xl">
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" alt="Banner" />
          <div class="absolute inset-0 bg-gradient-to-r from-[#b61323] via-[#b61323]/80 to-transparent"></div>

          <div class="relative z-10 px-6 md:px-16 space-y-3 md:space-y-4">
            <div class="inline-flex items-center bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <span class="text-[10px] font-bold uppercase tracking-widest text-white">Radiant Commerce</span>
            </div>
            <h2 class="text-3xl md:text-6xl font-extrabold text-white font-[Plus_Jakarta_Sans] leading-tight tracking-tighter">
              Sirmem Radiant<br />Commerce
            </h2>
            <p class="text-white/90 text-sm md:text-xl font-medium max-w-md hidden md:block">
              Join the Best Group-Buys. Curated premium selections at community-driven prices.
            </p>
            <div class="pt-2 md:pt-4 flex gap-3 md:gap-4">
              <button class="bg-white text-[#b61323] font-bold px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-xs md:text-base">
                Explore Now
              </button>
              <button class="bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold px-6 py-3 md:px-8 md:py-4 rounded-xl hover:bg-white/20 transition-all active:scale-95 text-xs md:text-base">
                How it works
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="px-6 mb-8 space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div class="space-y-3 relative">
              <span class="text-xs font-bold uppercase tracking-widest text-[#767777] block">Source</span>
              <button
                type="button"
                class="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-white text-[#2d2f2f] text-sm font-semibold shadow-sm border border-transparent hover:border-[#acadad] transition-all"
                @click="toggleSourceMenu"
              >
                <span>{{ sourceLabel }}</span>
                <span class="material-symbols-outlined text-base text-[#767777]">expand_more</span>
              </button>

              <div v-if="sourceMenuOpen" class="absolute z-20 mt-2 w-full rounded-2xl bg-white shadow-xl border border-[#ececec] p-2 space-y-1">
                <button
                  type="button"
                  class="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  :class="selectedSource ? 'text-[#5a5c5c] hover:bg-[#f6f6f6]' : 'bg-[#ffc2cb] text-[#84213d]'"
                  @click="selectSource('')"
                >
                  全部来源
                </button>
                <div v-if="sourceLoading" class="px-4 py-2 text-sm text-[#767777]">来源加载中...</div>
                <template v-else>
                  <button
                    v-for="source in sourceOptions"
                    :key="source"
                    type="button"
                    class="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    :class="selectedSource === source ? 'bg-[#ffc2cb] text-[#84213d]' : 'text-[#5a5c5c] hover:bg-[#f6f6f6]'"
                    @click="selectSource(source)"
                  >
                    {{ source }}
                  </button>
                </template>
              </div>
            </div>

            <div class="space-y-3 relative">
              <span class="text-xs font-bold uppercase tracking-widest text-[#767777] block">Channel</span>
              <button
                type="button"
                class="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-semibold shadow-sm border transition-all"
                :class="selectedSource ? 'bg-white text-[#2d2f2f] border-transparent hover:border-[#acadad]' : 'bg-[#f0f1f1] text-[#9a9c9c] border-transparent cursor-not-allowed'"
                :disabled="!selectedSource"
                @click="toggleChannelMenu"
              >
                <span>{{ channelLabel }}</span>
                <span class="material-symbols-outlined text-base text-[#767777]">expand_more</span>
              </button>

              <div v-if="channelMenuOpen" class="absolute z-20 mt-2 w-full rounded-2xl bg-white shadow-xl border border-[#ececec] p-2 space-y-1">
                <button
                  type="button"
                  class="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  :class="selectedChannel ? 'text-[#5a5c5c] hover:bg-[#f6f6f6]' : 'bg-[#ffc2cb] text-[#84213d]'"
                  @click="selectChannel('')"
                >
                  全部渠道
                </button>
                <div v-if="channelLoading" class="px-4 py-2 text-sm text-[#767777]">渠道加载中...</div>
                <template v-else>
                  <button
                    v-for="channel in channelOptions"
                    :key="channel"
                    type="button"
                    class="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    :class="selectedChannel === channel ? 'bg-[#ffc2cb] text-[#84213d]' : 'text-[#5a5c5c] hover:bg-[#f6f6f6]'"
                    @click="selectChannel(channel)"
                  >
                    {{ channel }}
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="px-6">
        <div class="flex items-end justify-between mb-6">
          <div>
            <h3 class="text-2xl md:text-3xl font-extrabold font-[Plus_Jakarta_Sans] tracking-tight text-[#2d2f2f]">Signature Selection</h3>
            <p class="text-sm text-[#767777] mt-2">共 {{ total }} 件活动商品</p>
          </div>
        </div>

        <div v-if="loading" class="rounded-3xl bg-white/80 border border-dashed border-[#e5d6d9] px-6 py-12 text-center text-[#767777]">
          正在加载首页商品...
        </div>

        <div v-else-if="!hasGoods" class="rounded-3xl bg-white/80 border border-dashed border-[#e5d6d9] px-6 py-12 text-center" data-testid="home-empty">
          <p class="text-lg font-bold text-[#2d2f2f]">暂无可展示商品</p>
          <p class="text-sm text-[#767777] mt-2">可以尝试切换来源或渠道后再次查看。</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <article
            v-for="goods in goodsList"
            :key="goods.activityId"
            class="bg-white rounded-xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <button type="button" class="block w-full text-left" @click="openGoodsDetail(goods.goodsId)">
              <div class="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                <img :src="getGoodsImage(goods)" :alt="goods.goodsName" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div class="absolute top-4 left-4">
                  <span class="bg-[#b61323] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">SAVE {{ formatSaveAmount(goods) }}</span>
                </div>

                <div class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-sm">
                  <div class="flex items-center justify-between text-[10px] font-bold text-[#9f3650] uppercase tracking-tighter mb-1.5">
                    <span>Team Progress</span>
                    <span>{{ goods.inventory?.availableStock ?? 0 }} left</span>
                  </div>
                  <div class="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-[#b61323] h-full rounded-full transition-all duration-1000" :style="{ width: `${getProgress(goods)}%` }"></div>
                  </div>
                  <p class="text-[10px] text-[#5a5c5c] mt-1.5 font-medium">{{ getJoinedText(goods) }}</p>
                </div>
              </div>

              <div class="p-5 space-y-4">
                <h4 class="text-lg font-bold font-[Plus_Jakarta_Sans] leading-tight text-[#2d2f2f] line-clamp-1">{{ goods.goodsName }}</h4>
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl font-black text-[#b61323]">{{ formatPrice(goods.payPrice) }}</span>
                  <span class="text-sm text-[#767777] line-through">{{ formatPrice(goods.originalPrice) }}</span>
                </div>
                <span class="block w-full bg-gradient-to-r from-[#b61323] to-[#ff7671] text-white py-3.5 rounded-xl font-bold text-center shadow-md">
                  Join Group Buy
                </span>
              </div>
            </button>
          </article>
        </div>
      </section>
    </main>

    <button class="fixed right-6 bottom-24 bg-gradient-to-br from-[#b61323] to-[#ff7671] text-white w-14 h-14 rounded-full shadow-[0_12px_24px_rgba(182,19,35,0.3)] flex items-center justify-center active:scale-90 transition-transform z-40">
      <span class="material-symbols-outlined">add</span>
    </button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0');

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
