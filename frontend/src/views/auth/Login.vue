<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Logo 和標題 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
          <span class="text-3xl">🎌</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Nihongo Quest</h1>
        <p class="text-gray-600">歡迎回到日語冒險世界</p>
      </div>

      <!-- 登入表單 -->
      <div class="game-card p-6">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 用戶名 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              用戶名
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="game-input"
              :class="{ 'border-red-500': errors.username }"
              placeholder="請輸入用戶名"
              autocomplete="username"
            >
            <p v-if="errors.username" class="mt-1 text-sm text-red-500">{{ errors.username }}</p>
          </div>

          <!-- 密碼 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="game-input pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="請輸入密碼"
                autocomplete="current-password"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>
          </div>

          <!-- 記住我 -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.remember"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200"
              >
              <span class="ml-2 text-sm text-gray-600">記住我</span>
            </label>
            <a href="#" class="text-sm text-primary-600 hover:text-primary-500">
              忘記密碼？
            </a>
          </div>

          <!-- 錯誤提示 -->
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-700">{{ authStore.error }}</p>
          </div>

          <!-- 登入按鈕 -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full game-button"
            :class="{ 'opacity-50 cursor-not-allowed': authStore.loading }"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登入中...
            </span>
            <span v-else>登入遊戲</span>
          </button>
        </form>

        <!-- 註冊鏈接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            還沒有帳號？
            <router-link
              to="/auth/register"
              class="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              立即註冊
            </router-link>
          </p>
        </div>
      </div>

      <!-- 遊客模式 -->
      <div class="mt-4 text-center">
        <button
          @click="guestMode"
          class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          🎮 體驗遊客模式
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