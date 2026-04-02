<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { id: 'home', label: '首页', icon: 'home', to: '/' },
  { id: 'orders', label: '订单', icon: 'receipt_long', to: '/orders' },
  { id: 'profile', label: '我的', icon: 'person', to: '/profile' },
]

function isTabActive(tabTo: string) {
  if (tabTo === '/') return route.path === '/'
  return route.path === tabTo || route.path.startsWith(`${tabTo}/`)
}

async function handleTabClick(tabTo: string) {
  if (isTabActive(tabTo)) return
  await router.push(tabTo)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-safe pt-2 bg-white/90 backdrop-blur-xl z-50 border-t border-zinc-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-4 md:pb-2">
    <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        @click="handleTabClick(tab.to)"
        class="sirmem-bottom-nav__item flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 active:scale-90"
        :class="isTabActive(tab.to) ? 'is-active bg-red-50 text-[#b61323]' : 'text-[#9c9d9d] hover:text-[#b61323]/70'"
        :aria-current="isTabActive(tab.to) ? 'page' : undefined"
    >
        <span
            class="sirmem-bottom-nav__icon material-symbols-outlined transition-all duration-300"
            :style="{ fontVariationSettings: isTabActive(tab.to) ? '\'FILL\' 1' : '\'FILL\' 0' }"
        >
          {{ tab.icon }}
        </span>
      <span class="text-[10px] font-semibold uppercase tracking-wider mt-1">{{ tab.label }}</span>
    </button>
  </nav>
</template>
