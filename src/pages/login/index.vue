<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { checkLogin, getWeixinTicket, login, register, toAccountAuthState } from '../../services/auth'
import { useAuthStore } from '../../store/auth'

type LoginTab = 'wechat' | 'account'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<LoginTab>('wechat')
const loading = ref(false)
const isRegisterMode = ref(false)

const wechatLoading = ref(false)
const wechatPolling = ref(false)
const ticket = ref('')
const pollCount = ref(0)
const maxPollCount = 60
let pollTimer: number | null = null

const form = reactive({
  username: '',
  password: '',
})

const qrcodeUrl = computed(() => {
  if (!ticket.value) return ''
  return `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(ticket.value)}`
})

const showPassword = ref(false);

const wechatTitle = computed(() => 'WeChat login')


const wechatStatusText = computed(() => {
  if (wechatLoading.value) return '二维码加载中，请稍候…'
  if (!qrcodeUrl.value) return '二维码加载失败，请刷新后重试。'
  if (wechatPolling.value) return `正在检测登录状态（${pollCount.value}/${maxPollCount}）`
  if (pollCount.value >= maxPollCount) return '二维码已超时，请刷新二维码后重新扫码。'
  return '二维码已就绪，请使用微信扫码登录。'
})

function stopPolling() {
  wechatPolling.value = false
  if (pollTimer !== null) {
    window.clearTimeout(pollTimer)
    pollTimer = null
  }
}

async function pollWechatLogin() {
  if (!ticket.value) return

  try {
    const response = await checkLogin(ticket.value)

    if ((response.code === '0000' || response.code === 200) && response.data) {
      authStore.setWechatAuth(response.data)
      stopPolling()
      ElMessage.success('微信登录成功')
      await router.replace('/')
      return
    }

    pollCount.value += 1
    if (pollCount.value >= maxPollCount) {
      stopPolling()
      ElMessage.warning('登录超时，请刷新重试')
      return
    }

    pollTimer = window.setTimeout(() => {
      void pollWechatLogin()
    }, 2000)
  } catch (error: any) {
    stopPolling()
    const message = error?.response?.data?.info || error?.message || '微信登录检测失败'
    ElMessage.error(message)
  }
}

async function loadWechatQrcode() {
  stopPolling()
  wechatLoading.value = true
  pollCount.value = 0
  ticket.value = ''

  try {
    const response = await getWeixinTicket()
    if (!((response.code === '0000' || response.code === 200) && response.data)) {
      ElMessage.error(response.info || '获取微信二维码失败')
      return
    }

    ticket.value = response.data
    wechatPolling.value = true
    pollTimer = window.setTimeout(() => {
      void pollWechatLogin()
    }, 2000)
  } catch (error: any) {
    const message = error?.response?.data?.info || error?.message || '获取微信二维码失败'
    ElMessage.error(message)
  } finally {
    wechatLoading.value = false
  }
}

async function submitAccount() {
  if (!form.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.password.trim()) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    const response = isRegisterMode.value
      ? await register({ username: form.username.trim(), password: form.password })
      : await login({ username: form.username.trim(), password: form.password })

    const accountAuth = toAccountAuthState(response.data, form.username.trim())

    if (!(response.code === 200 && accountAuth)) {
      ElMessage.error(response.info || (isRegisterMode.value ? '注册失败' : '登录失败'))
      return
    }

    authStore.setAccountAuth(accountAuth)

    ElMessage.success(isRegisterMode.value ? '注册成功，已自动登录' : '登录成功')
    await router.replace('/')
  } catch (error: any) {
    const message = error?.response?.data?.info || error?.message || (isRegisterMode.value ? '注册失败' : '登录失败')
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'wechat' && !ticket.value && !wechatLoading.value) {
    void loadWechatQrcode()
    return
  }

  if (tab !== 'wechat') {
    stopPolling()
  } else if (ticket.value && !wechatPolling.value) {
    wechatPolling.value = true
    pollTimer = window.setTimeout(() => {
      void pollWechatLogin()
    }, 2000)
  }
})

onMounted(() => {
  if (activeTab.value === 'wechat') {
    void loadWechatQrcode()
  }
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-5 font-sans">
    <div class="w-full max-w-[420px] bg-white rounded-[30px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">

      <div class="mb-8">
        <h1 class="text-[32px] font-extrabold italic text-[#c81e2b] tracking-tight mb-2 m-0">
          Sirmem
        </h1>
        <p class="text-gray-500 text-base m-0">Welcome to Radiant Shopping</p>
      </div>

      <div class="flex border-b border-gray-200 mb-8">
        <button
            class="relative pb-3 mr-8 text-[15px] font-semibold cursor-pointer transition-colors"
            :class="activeTab === 'account' ? 'text-[#c81e2b] after:content-[\'\'] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[2px] after:bg-[#c81e2b]' : 'text-gray-400 hover:text-gray-600'"
            @click="activeTab = 'account'"
        >
          Account Login
        </button>
        <button
            class="relative pb-3 mr-8 text-[15px] font-semibold cursor-pointer transition-colors"
            :class="activeTab === 'wechat' ? 'text-[#c81e2b] after:content-[\'\'] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[2px] after:bg-[#c81e2b]' : 'text-gray-400 hover:text-gray-600'"
            @click="activeTab = 'wechat'"
        >
          WeChat Login
        </button>
      </div>

      <div v-if="activeTab === 'account'" class="flex flex-col">

        <div class="flex flex-col gap-2 mb-5">
          <label class="text-xs text-gray-600 font-semibold tracking-wide uppercase">Username or Email</label>
          <div class="flex items-center bg-[#f4f5f7] rounded-xl px-4 h-[50px]">
            <svg class="w-5 h-5 text-gray-500 mr-2.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <input
                type="text"
                v-model="form.username"
                placeholder="Enter your account"
                class="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-800 placeholder-gray-400 w-full"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2 mb-5">
          <label class="text-xs text-gray-600 font-semibold tracking-wide uppercase">Password</label>
          <div class="flex items-center bg-[#f4f5f7] rounded-xl px-4 h-[50px]">
            <svg class="w-5 h-5 text-gray-500 mr-2.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                placeholder="••••••••"
                class="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-800 placeholder-gray-400 w-full tracking-widest"
            />
            <button
                @click="showPassword = !showPassword"
                type="button"
                class="p-1 ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg v-if="!showPassword" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>



        <button
            @click="submitAccount()"
            class="w-full h-[54px] rounded-xl bg-gradient-to-r from-[#c81e2b] to-[#eb5b67] text-white font-semibold text-[16px] shadow-[0_6px_15px_rgba(200,30,43,0.2)] hover:opacity-90 transition-opacity mt-1"
        >
          Log In / Sign Up
        </button>
      </div>

      <div v-else class="flex flex-col items-center justify-center min-h-[280px] p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 transition-all duration-300">

        <h3 class="text-[15px] font-semibold text-gray-800 mb-5 tracking-wide uppercase">
          {{ wechatTitle }}
        </h3>

        <div v-if="wechatLoading" class="flex flex-col items-center justify-center w-40 h-40">
          <svg class="animate-spin h-8 w-8 text-[#c81e2b] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-gray-400">获取二维码中...</span>
        </div>

        <div v-else-if="qrcodeUrl" class="relative group cursor-pointer" @click="loadWechatQrcode" title="点击刷新二维码">
          <img
              :src="qrcodeUrl"
              alt="WeChat QR Code"
              class="w-40 h-40 object-contain bg-white p-2 rounded-xl shadow-sm border border-gray-100"
          />

          <div
              class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-xl text-white transition-opacity duration-200"
              :class="(pollCount >= maxPollCount) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="text-xs">{{ pollCount >= maxPollCount ? '已过期，点击刷新' : '点击刷新' }}</span>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center w-40 h-40 cursor-pointer" @click="loadWechatQrcode">
          <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2 text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <span class="text-sm text-[#c81e2b] hover:underline font-medium">加载失败，点击重试</span>
        </div>

        <p
            class="mt-5 text-[13px] font-medium text-center transition-colors"
            :class="[
      pollCount >= maxPollCount ? 'text-red-500' : 'text-gray-500',
      wechatPolling ? 'animate-pulse' : ''
    ]"
        >
          {{ wechatStatusText }}
        </p>

      </div>


    </div>
  </div>
</template>


<style scoped>
.login-page {
  position: relative;
  background-color: #f6f6f6;
}

.login-frame {
  background: #ffffff;
}

.login-editorial {
  min-height: 720px;
  background: linear-gradient(135deg, #f6f6f6 0%, #f0f1f1 100%);
}

.login-editorial__image {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.55), transparent 22%),
    radial-gradient(circle at 78% 30%, rgba(255, 194, 203, 0.42), transparent 24%),
    linear-gradient(145deg, #f7d7cf 0%, #f2e3db 32%, #e8ddd5 68%, #d9d6d2 100%);
}

.login-editorial__image::before {
  content: '';
  position: absolute;
  inset: 10% 12% auto auto;
  width: 220px;
  height: 280px;
  border-radius: 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.08));
  box-shadow: 0 24px 60px rgba(78, 54, 44, 0.16);
  transform: rotate(8deg);
}

.login-editorial__image::after {
  content: '';
  position: absolute;
  inset: auto auto 12% 10%;
  width: 260px;
  height: 180px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  filter: blur(4px);
}

.login-editorial__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(182, 19, 35, 0.6), transparent 55%);
}

.login-brand-mark {
  font-family: 'Plus Jakarta Sans', var(--el-font-family), sans-serif;
}

.login-input-shell :deep(.el-input__wrapper) {
  min-height: 56px;
  padding-left: 44px;
  border-radius: 0.75rem;
  border: none;
  background: #f0f1f1;
  box-shadow: none;
}

.login-input-shell :deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(182, 19, 35, 0.12);
}

.login-input-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  z-index: 2;
  transform: translateY(-50%);
  font-size: 18px;
  line-height: 1;
  opacity: 0.66;
}

.login-primary-btn {
  border-radius: 0.75rem;
  background: linear-gradient(to right, #b61323, #ff7671) !important;
  box-shadow: 0 12px 24px rgba(182, 19, 35, 0.15) !important;
}

.login-primary-btn:hover {
  transform: scale(1.02);
}

.login-primary-btn:active {
  transform: scale(0.98);
}

.login-ambient {
  position: fixed;
  z-index: 0;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(120px);
}

.login-ambient--primary {
  top: -10%;
  right: -5%;
  width: 40%;
  height: 40%;
  background: rgba(182, 19, 35, 0.08);
}

.login-ambient--secondary {
  bottom: -10%;
  left: -5%;
  width: 40%;
  height: 40%;
  background: rgba(159, 54, 80, 0.08);
}

@media (max-width: 767px) {
  .login-frame {
    border-radius: 1.5rem;
  }
}
</style>
