<template>
  <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group transition-all duration-300 hover:shadow-xl hover:shadow-[#c81e2b]/5">
    <div class="px-5 py-2.5 flex items-center justify-between text-white bg-gray-800">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-lg">receipt_long</span>
        <span class="text-xs font-bold uppercase tracking-widest">ORDER</span>
      </div>
      <span class="text-xs font-medium">{{ props.statusDetail }}</span>
    </div>

    <div class="relative bg-[#f8f9fa] aspect-[16/10] overflow-hidden flex items-center justify-center p-6">
      <img :src="props.productImage || DEFAULT_ORDER_IMAGE" :alt="props.productName" class="w-auto h-full object-contain group-hover:scale-105 transition-transform duration-700"/>
    </div>

    <div class="p-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h4 class="text-lg font-bold leading-tight text-gray-900">{{ props.productName }}</h4>
          <p class="text-sm text-gray-400 mt-1 font-medium tracking-tight">Order #{{ props.orderId }}</p>
        </div>
        <p class="text-3xl font-black text-[#c81e2b] leading-none shrink-0">{{ formatCurrency(props.totalAmount) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const DEFAULT_ORDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200" fill="none"%3E%3Crect width="320" height="200" rx="24" fill="%23f3f4f6"/%3E%3Cpath d="M92 122c0-4.418 3.582-8 8-8h120c4.418 0 8 3.582 8 8v6H92v-6Z" fill="%23d1d5db"/%3E%3Cpath d="M114 78c0-3.314 2.686-6 6-6h80c3.314 0 6 2.686 6 6v36h-92V78Z" fill="%23e5e7eb"/%3E%3Ccircle cx="126" cy="144" r="12" fill="%239ca3af"/%3E%3Ccircle cx="194" cy="144" r="12" fill="%239ca3af"/%3E%3C/svg%3E'

interface OrderCardProps {
  productName: string
  orderId: string
  statusDetail: string
  totalAmount: number | string
  productImage?: string
}

const props = defineProps<OrderCardProps>()

function formatCurrency(value: number | string) {
  if (typeof value === 'number') {
    return `¥${value.toFixed(2)}`
  }

  const normalized = value.trim()

  if (!normalized) {
    return '¥0.00'
  }

  if (normalized.startsWith('¥')) {
    return normalized
  }

  const numericValue = Number(normalized)
  if (!Number.isNaN(numericValue)) {
    return `¥${numericValue.toFixed(2)}`
  }

  return normalized
}
</script>
