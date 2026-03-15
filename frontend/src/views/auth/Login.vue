<template>
  <!-- 移动端专业登录页 - 与注册页统一设计 -->
  <div class="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary flex items-center justify-center p-5 relative overflow-hidden">
    
    <!-- 樱花飘落装饰 -->
    <div class="bg-sakura absolute inset-0 pointer-events-none z-0"></div>
    
    <div class="max-w-sm w-full relative z-10">
      <!-- Logo 和标题 - 与注册页一致 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6 ring-4 ring-primary-100">
          <span class="text-4xl">🌸</span>
        </div>
        <h1 class="text-2xl font-bold text-text-primary mb-3 tracking-wide">登入游戏</h1>
        <p class="text-text-secondary text-sm">欢迎回到日语冒险世界 ✨</p>
      </div>

      <!-- 登录表单卡片 - iPhone 适配 -->
      <div class="bg-white rounded-2xl p-6 shadow-lg border border-primary-100 backdrop-blur-sm">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- 用户名 - 移动端优化 -->
          <div>
            <label for="username" class="block text-sm font-semibold text-text-primary mb-2">
              用户名
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="w-full h-[52px] px-4 py-3 border border-gray-200 rounded-xl text-base bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300 outline-none"
              :class="{ 'border-error focus:border-error focus:ring-red-100': errors.username }"
              placeholder="输入用户名"
              autocomplete="username"
            >
            <p v-if="errors.username" class="mt-2 text-sm text-error">{{ errors.username }}</p>
          </div>

          <!-- 密码 - 移动端优化 -->
          <div>
            <label for="password" class="block text-sm font-semibold text-text-primary mb-2">
              密码
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full h-[52px] px-4 py-3 pr-12 border border-gray-200 rounded-xl text-base bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300 outline-none"
                :class="{ 'border-error focus:border-error focus:ring-red-100': errors.password }"
                placeholder="输入密码"
                autocomplete="current-password"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center touch-target"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-text-secondary" />
                <EyeSlashIcon v-else class="h-5 w-5 text-text-secondary" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-2 text-sm text-error">{{ errors.password }}</p>
          </div>

          <!-- 记住我和忘记密码 - 移动端布局 -->
          <div class="flex items-center justify-between py-1">
            <label class="flex items-center space-x-2">
              <input
                v-model="form.remember"
                type="checkbox"
                class="w-5 h-5 rounded border-2 border-gray-300 text-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              >
              <span class="text-sm text-text-secondary">记住我</span>
            </label>
            <a href="#" class="text-sm text-primary-400 hover:text-primary-500 transition-colors font-medium">
              忘记密码？
            </a>
          </div>

          <!-- 错误提示 - 移动端优化 -->
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-error mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-error font-medium">{{ authStore.error }}</p>
            </div>
          </div>

          <!-- 登录按钮 - iPhone 触控标准 -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full h-[52px] bg-gradient-to-r from-primary-400 to-primary-500 text-white text-base font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center touch-target"
            :class="{ 
              'opacity-50 cursor-not-allowed': authStore.loading,
              'hover:from-primary-500 hover:to-primary-600 hover:shadow-xl hover:-translate-y-1 active:translate-y-0': !authStore.loading
            }"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
            <span v-else class="flex items-center">
              登入游戏 
              <span class="ml-2">🎮</span>
            </span>
          </button>
        </form>

        <!-- 注册链接 - 移动端居中 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-text-secondary">
            还没有账号？
            <router-link
              to="/auth/register"
              class="font-semibold text-primary-400 hover:text-primary-500 transition-colors ml-1"
            >
              立即注册
            </router-link>
          </p>
        </div>
      </div>

      <!-- 游客模式 - 移动端优化 -->
      <div class="mt-6 text-center">
        <button
          @click="guestMode"
          class="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium flex items-center mx-auto"
        >
          <span class="mr-2">🎮</span>
          体验游客模式
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表單數據
const form = reactive({
  username: '',
  password: '',
  remember: false
})

// 顯示密碼
const showPassword = ref(false)

// 表單驗證錯誤
const errors = reactive({
  username: '',
  password: ''
})

// 表單驗證
const validateForm = () => {
  let isValid = true

  // 重置錯誤
  errors.username = ''
  errors.password = ''

  // 驗證用戶名
  if (!form.username.trim()) {
    errors.username = '請輸入用戶名'
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = '用戶名至少3個字符'
    isValid = false
  }

  // 驗證密碼
  if (!form.password) {
    errors.password = '請輸入密碼'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密碼至少6個字符'
    isValid = false
  }

  return isValid
}

// 處理登入
const handleLogin = async () => {
  if (!validateForm()) return

  const result = await authStore.login({
    username: form.username.trim(),
    password: form.password
  })

  if (result.success) {
    // 登入成功，重定向
    const redirectPath = route.query.redirect || '/game/map'
    router.push(redirectPath)
  }
}

// 遊客模式
const guestMode = () => {
  // TODO: 實現遊客模式
  router.push('/game/map')
}
</script>