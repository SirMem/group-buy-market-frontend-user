<template>
  <div class="min-h-screen bg-[#f5f6f8] pb-28 font-sans text-gray-800">

    <header class="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-[#f5f6f8]">
      <button class="text-gray-600 hover:opacity-70 transition-opacity">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <h1 class="text-2xl font-black italic tracking-tighter text-[#c81e2b]">Sirmem</h1>
      <button class="text-gray-600 hover:opacity-70 transition-opacity">
        <span class="material-symbols-outlined">notifications</span>
      </button>
    </header>

    <main class="px-5 space-y-6">
      <section class="flex items-center gap-4 pt-2">
        <div class="relative">
          <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=282a36"
              alt="Eleanor Vance"
              class="w-20 h-20 rounded-full border-2 border-white object-cover bg-gray-800 shadow-sm"
          />
          <div class="absolute bottom-0 right-0 w-6 h-6 bg-[#c81e2b] border-2 border-[#f5f6f8] rounded-full flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-white text-[12px] font-bold">verified</span>
          </div>
        </div>

        <div class="flex flex-col items-start gap-1.5">
          <h2 class="text-2xl font-bold text-gray-900 leading-none">Eleanor Vance</h2>
          <div class="flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full">
            <span class="material-symbols-outlined text-[#c81e2b] text-[14px]">stars</span>
            <span class="text-[10px] font-bold text-[#c81e2b] tracking-widest uppercase mt-px">Gold Member</span>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-3 gap-3">
        <div v-for="(stat, index) in stats" :key="index" class="bg-white py-4 rounded-2xl flex flex-col items-center justify-center shadow-sm">
          <span class="text-xl font-bold text-[#c81e2b]">{{ stat.value }}</span>
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{{ stat.label }}</span>
        </div>
      </section>

      <section class="bg-white rounded-3xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-gray-900">My Orders</h3>
          <button class="flex items-center text-[#c81e2b] text-xs font-bold hover:underline">
            <span class="tracking-widest uppercase">View All</span>
            <span class="material-symbols-outlined text-[16px] ml-0.5">chevron_right</span>
          </button>
        </div>

        <div class="flex justify-between items-center px-1">
          <button v-for="(step, index) in orderSteps" :key="index" class="flex flex-col items-center gap-2 group">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
              <span class="material-symbols-outlined text-[#c81e2b]">{{ step.icon }}</span>
            </div>
            <span class="text-xs text-gray-500 font-medium">{{ step.label }}</span>
          </button>
        </div>
      </section>

      <section class="bg-white rounded-3xl overflow-hidden shadow-sm">
        <button v-for="(item, index) in menuItems" :key="index" class="w-full flex items-center justify-between p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 active:bg-gray-100 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <span class="material-symbols-outlined text-[#902b46] text-[20px]">{{ item.icon }}</span>
            </div>
            <span class="text-[15px] font-bold text-gray-900">{{ item.label }}</span>
          </div>
          <span class="material-symbols-outlined text-gray-300 text-[20px]">chevron_right</span>
        </button>
      </section>

      <section class="pt-2 flex flex-col items-center gap-4">
        <button class="w-full bg-gradient-to-r from-[#c81e2b] to-[#eb5b67] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#c81e2b]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:opacity-95">
          <span class="material-symbols-outlined">logout</span>
          Logout Account
        </button>

        <button class="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
          Switch Account
        </button>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Stats Data
const stats = ref([
  { label: 'Coupons', value: '12' },
  { label: 'Points', value: '2.4k' },
  { label: 'Wishlist', value: '48' }
]);

// Order Steps Data
const orderSteps = ref([
  { label: 'Pending', icon: 'payments' },
  { label: 'To Ship', icon: 'inventory_2' },
  { label: 'To Receive', icon: 'local_shipping' },
  { label: 'Refunds', icon: 'assignment_return' }
]);

// Menu Items Data
const menuItems = ref([
  { label: 'Shipping Address', icon: 'location_on' },
  { label: 'Customer Service', icon: 'support_agent' },
  { label: 'About Sirmem', icon: 'info' },
  { label: 'Settings', icon: 'settings' }
]);
</script>

<style scoped>
/* Load Material Symbols Outlined font from Google Fonts (Ensure this is in your index.html normally) */
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* Helper class to ensure consistent scaling and rendering of icons */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>