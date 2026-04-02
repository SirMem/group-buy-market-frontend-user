<template>
  <div class="min-h-screen bg-gray-50 pb-24 font-sans text-gray-800">
    <header class="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100 shadow-sm">
      <button class="p-1 -ml-1 text-gray-700 hover:opacity-70">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <h1 class="text-xl font-black italic tracking-tighter text-[#c81e2b]">Sirmem</h1>
      <button class="p-1 -mr-1 text-gray-700 hover:opacity-70">
        <span class="material-symbols-outlined">notifications</span>
      </button>
    </header>

    <section class="p-6 space-y-2">
      <h2 class="text-3xl font-extrabold text-gray-950 font-sans tracking-tight">Your Orders</h2>
      <p class="text-base text-gray-500 max-w-lg leading-relaxed">Review your curated selections and community buys.</p>
    </section>

    <section class="px-6 mb-8">
      <div class="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-2 px-2">
        <button
          v-for="tab in filterTabs"
          :key="tab"
          :class="['px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-150', activeFilter === tab ? 'bg-red-100 text-[#c81e2b]' : 'bg-gray-100 text-gray-600']"
          type="button"
        >
          {{ tab }}
        </button>
      </div>
    </section>

    <main class="px-5 space-y-6">
      <p v-if="loading" class="rounded-3xl border border-gray-100 bg-white px-6 py-8 text-sm text-gray-500">Loading orders...</p>
      <p v-else-if="errorMessage" class="rounded-3xl border border-red-100 bg-red-50 px-6 py-8 text-sm font-medium text-red-700">{{ errorMessage }}</p>
      <p v-else-if="orderCards.length === 0" class="rounded-3xl border border-gray-100 bg-white px-6 py-8 text-sm text-gray-500">No orders yet.</p>

      <template v-else>
        <OrderCard
          v-for="order in orderCards"
          :key="order.orderId"
          :order-id="order.orderId"
          :product-name="order.productName"
          :status-detail="order.statusDetail"
          :total-amount="order.totalAmount"
          :product-image="order.productImage"
        />
      </template>

      <button
        v-if="hasMore && !loading"
        class="w-full rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#c81e2b] shadow-sm border border-gray-100"
        type="button"
        @click="loadOrders(false)"
      >
        Load more
      </button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import OrderCard from '../../components/OrderCard.vue'
import { queryUserOrderList, type OrderInfoDTO } from '../../services/order'
import { useAuthStore } from '../../store/auth'

const filterTabs = ['ALL']
const activeFilter = ref('ALL')
const authStore = useAuthStore()
const orders = ref<OrderInfoDTO[]>([])
const loading = ref(false)
const errorMessage = ref('')
const hasMore = ref(false)
const lastId = ref<number | null>(null)
const pageSize = 10

const orderCards = computed(() =>
  orders.value.map((order) => ({
    productName: order.productName,
    orderId: order.orderId,
    statusDetail: order.status,
    totalAmount: order.totalAmount,
    productImage: undefined,
  })),
)

async function loadOrders(reset = true) {
  if (!authStore.userId || loading.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await queryUserOrderList({
      userId: authStore.userId,
      lastId: reset ? null : lastId.value,
      pageSize,
    })

    if ((response.code === '0000' || response.code === 200) && response.data) {
      const nextOrders = response.data.orderList ?? []
      orders.value = reset ? nextOrders : [...orders.value, ...nextOrders]
      hasMore.value = Boolean(response.data.hasMore)
      lastId.value = response.data.lastId ?? null
      return
    }

    errorMessage.value = response.info || 'Failed to load orders.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load orders.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadOrders(true)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
