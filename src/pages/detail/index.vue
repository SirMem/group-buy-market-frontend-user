<template>
  <div class="min-h-screen bg-gray-50 pb-28 font-sans text-gray-900">

    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md">
      <button class="p-1 hover:bg-gray-100 rounded-full transition-colors">
        <span class="material-symbols-outlined text-gray-800">arrow_back</span>
      </button>
      <h1 class="text-xl font-black italic tracking-tighter text-[#c81e2b]">Sirmem</h1>
      <div class="flex items-center gap-2">
        <button class="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <span class="material-symbols-outlined text-gray-800 text-[22px]">share</span>
        </button>
        <button class="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <span class="material-symbols-outlined text-gray-800 text-[22px]">shopping_bag</span>
        </button>
      </div>
    </header>

    <section class="relative bg-[#e6e2d8] w-full aspect-[4/5] flex items-center justify-center pt-12">
      <img src="https://images.unsplash.com/photo-1612196808214-b7e239e5d6d2?q=80&w=800&auto=format&fit=crop" alt="Artisan Vase" class="w-3/4 h-3/4 object-contain mix-blend-multiply drop-shadow-2xl" />

      <div class="absolute bottom-4 left-4 flex gap-2">
        <span class="px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#c81e2b] bg-white rounded-full uppercase shadow-sm">New Arrival</span>
        <span class="px-2.5 py-1 text-[10px] font-bold tracking-widest text-white bg-gray-800 rounded-full uppercase shadow-sm">Editorial Pick</span>
      </div>
    </section>

    <section class="p-5 bg-white">
      <h2 class="text-2xl font-bold leading-tight text-gray-900 mb-4 tracking-tight">
        Nordic Sculptural Series: Artisan Vase No. 04
      </h2>

      <div class="flex items-end gap-3 mb-4">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold tracking-widest text-[#c81e2b] uppercase mb-0.5">Group Price</span>
          <span class="text-4xl font-black text-[#c81e2b] leading-none">$5.90</span>
        </div>
        <div class="flex flex-col pb-0.5">
          <span class="text-xs text-gray-400 line-through font-medium mb-1">$9.90</span>
          <span class="px-1.5 py-0.5 text-[9px] font-bold text-[#c81e2b] bg-red-100 rounded uppercase tracking-wider">Save 40%</span>
        </div>
      </div>

      <p class="text-sm text-gray-600 leading-relaxed">
        Hand-finished stoneware with a unique matte texture. Each piece is individually cast to ensure a one-of-a-kind organic silhouette for your contemporary home.
      </p>
    </section>

    <section class="p-5 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-[15px] font-bold text-gray-900">Active Teams</h3>
        <button class="text-[11px] font-bold text-[#c81e2b] hover:underline">View all 12 teams</button>
      </div>

      <div class="space-y-3">
        <div v-for="(team, index) in activeTeams" :key="index" class="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-3">
            <div class="flex -space-x-2">
              <img :src="team.avatar" alt="User" class="w-10 h-10 rounded-full border-2 border-white object-cover bg-gray-200 z-10" />
              <div class="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold z-0">?</div>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-gray-900">{{ team.name }}</span>
              <span class="text-[10px] font-medium text-gray-500 mt-0.5">{{ team.slots }} slots filled</span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1.5">
            <span class="text-[10px] text-gray-500">Ends in <strong class="text-[#c81e2b]">{{ team.timeLeft }}</strong></span>
            <button class="px-4 py-1.5 bg-[#c81e2b] text-white text-[11px] font-bold rounded-lg shadow-sm active:scale-95 transition-transform">
              Join Team
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white sticky top-[56px] z-40 border-b border-gray-200">
      <div class="flex">
        <button
            v-for="tab in tabs" :key="tab.id"
            @click="currentTab = tab.id"
            class="flex-1 py-4 text-[13px] font-bold relative transition-colors"
            :class="currentTab === tab.id ? 'text-[#c81e2b]' : 'text-gray-500'"
        >
          {{ tab.label }}
          <div v-if="currentTab === tab.id" class="absolute bottom-0 left-0 w-full h-[2px] bg-[#c81e2b]"></div>
        </button>
      </div>
    </section>

    <section v-show="currentTab === 'details'" class="p-5 bg-white space-y-8">

      <div>
        <h3 class="text-[15px] font-bold text-gray-900 mb-4">Product Specification</h3>
        <div class="space-y-3">
          <div v-for="(spec, index) in specifications" :key="index" class="flex border-b border-gray-50 pb-2 text-[13px]">
            <span class="w-1/3 text-gray-500">{{ spec.label }}</span>
            <span class="w-2/3 text-gray-900 font-medium">{{ spec.value }}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-[15px] font-bold text-gray-900 mb-3">The Editorial Vision</h3>
        <p class="text-[13px] text-gray-600 leading-relaxed mb-4">
          Sirmem Goods brings you a collection focused on the intersection of form and function. Our Sculptural Series is inspired by the rugged coastline of the Nordic islands, utilizing raw materials that age beautifully over time.
        </p>
        <img src="https://images.unsplash.com/photo-1586521995568-39abaa0c2311?q=80&w=800&auto=format&fit=crop" alt="Texture Details" class="w-full h-32 object-cover rounded-xl mb-4" />
        <p class="text-[13px] text-gray-600 leading-relaxed">
          Every vase is high-fired to ensure durability while maintaining the delicate aesthetic of artisanal craft. Perfect as a standalone piece or paired with minimalist florals.
        </p>
      </div>
    </section>

    <section class="p-5 bg-gray-50">
      <h3 class="text-[15px] font-bold text-gray-900 mb-4">Complete the Collection</h3>
      <div class="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-5 px-5">
        <div v-for="(item, index) in collection" :key="index" class="min-w-[140px] flex-shrink-0 cursor-pointer group">
          <div class="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gray-200">
            <img :src="item.image" :alt="item.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <h4 class="text-xs font-bold text-gray-900 truncate">{{ item.title }}</h4>
          <p class="text-[13px] font-bold text-[#c81e2b] mt-0.5">{{ item.price }}</p>
        </div>
      </div>
    </section>

    <div class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex gap-3 items-center z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.04)]">

      <button class="flex flex-col items-center justify-center min-w-[48px] text-gray-400 hover:text-[#c81e2b] transition-colors">
        <span class="material-symbols-outlined text-[24px]">favorite</span>
        <span class="text-[9px] font-bold uppercase tracking-wider mt-0.5">Wish</span>
      </button>

      <button class="flex-1 h-12 rounded-full border-2 border-[#c81e2b] flex flex-col items-center justify-center bg-white text-[#c81e2b] active:bg-red-50 transition-colors">
        <span class="text-[9px] font-bold tracking-widest uppercase">Direct Buy</span>
        <span class="text-[15px] font-black leading-tight">$9.90</span>
      </button>

      <button class="flex-1 h-12 rounded-full bg-gradient-to-r from-[#c81e2b] to-[#eb5b67] flex flex-col items-center justify-center text-white shadow-lg shadow-[#c81e2b]/30 active:scale-[0.98] transition-all">
        <span class="text-[9px] font-bold tracking-widest uppercase text-white/90">Start Group Buy</span>
        <span class="text-[15px] font-black leading-tight">$5.90</span>
      </button>

    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

// Tabs 状态
const currentTab = ref('details');
const tabs = [
  { id: 'details', label: 'Details' },
  { id: 'reviews', label: 'Reviews (128)' },
  { id: 'shipping', label: 'Shipping' }
];

// 拼团数据
const activeTeams = ref([
  {
    name: "Sarah J.'s Team",
    slots: "1/3",
    timeLeft: "23h 59m",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4"
  },
  {
    name: "Michael R.'s Team",
    slots: "2/3",
    timeLeft: "10h 12m",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=c0aede"
  }
]);

// 规格参数
const specifications = ref([
  { label: 'Material', value: 'Fine-grain Stoneware' },
  { label: 'Dimensions', value: '18cm x 12cm x 12cm' },
  { label: 'Weight', value: '0.85 kg' },
  { label: 'Finish', value: 'Matte Frost White' }
]);

// 推荐系列数据
const collection = ref([
  {
    title: "Artisan Trinket Dish",
    price: "$3.90",
    image: "https://images.unsplash.com/photo-1612015900186-ea84bb3e3751?q=80&w=400&auto=format&fit=crop"
  },
  {
    title: "Sculptural Column Vase",
    price: "$7.50",
    image: "https://images.unsplash.com/photo-1581783342308-f792db8122d4?q=80&w=400&auto=format&fit=crop"
  },
  {
    title: "Nordic Minimalist Plate",
    price: "$6.20",
    image: "https://images.unsplash.com/photo-1603050478051-9db5d1dd3384?q=80&w=400&auto=format&fit=crop"
  }
]);
</script>

<style scoped>
/* 引入 Material Symbols (如果您项目中已有，可忽略此行) */
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

/* 隐藏横向滚动条，但保持可滚动 */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>