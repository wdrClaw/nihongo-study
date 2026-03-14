<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Logo 和標題 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
          <span class="text-3xl">🎌</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Nihongo Quest</h1>
        <p class="text-gray-600">開始你的日語學習冒險</p>
      </div>

      <!-- 註冊表單 -->
      <div class="game-card p-6">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 用戶名 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              用戶名 *
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="game-input"
              :class="{ 'border-red-500': errors.username }"
              placeholder="3-20個字符，只能包含字母、數字、下劃線"
              autocomplete="username"
            >
            <p v-if="errors.username" class="mt-1 text-sm text-red-500">{{ errors.username }}</p>
          </div>

          <!-- 暱稱 -->
          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-700 mb-2">
              暱稱（可選）
            </label>
            <input
              id="nickname"
              v-model="form.nickname"
              type="text"
              class="game-input"
              :class="{ 'border-red-500': errors.nickname }"
              placeholder="在遊戲中顯示的名稱"
            >
            <p v-if="errors.nickname" class="mt-1 text-sm text-red-500">{{ errors.nickname }}</p>
          </div>

          <!-- 郵箱 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              郵箱（可選）
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="game-input"
              :class="{ 'border-red-500': errors.email }"
              placeholder="用於找回密碼和通知"
              autocomplete="email"
            >
            <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
          </div>

          <!-- 密碼 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密碼 *
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="game-input pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="至少6個字符"
                autocomplete="new-password"
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

          <!-- 確認密碼 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              確認密碼 *
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              class="game-input"
              :class="{ 'border-red-500': errors.confirmPassword }"
              placeholder="請再次輸入密碼"
              autocomplete="new-password"
            >
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-500">{{ errors.confirmPassword }}</p>
          </div>

          <!-- 服務條款 -->
          <div class="flex items-start">
            <input
              id="agree"
              v-model="form.agree"
              type="checkbox"
              required
              class="mt-1 rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200"
            >
            <label for="agree" class="ml-2 text-sm text-gray-600">
              我已閱讀並同意
              <a href="#" class="text-primary-600 hover:text-primary-500">服務條款</a>
              和
              <a href="#" class="text-primary-600 hover:text-primary-500">隱私政策</a>
            </label>
          </div>

          <!-- 錯誤提示 -->
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-700">{{ authStore.error }}</p>
          </div>

          <!-- 註冊按鈕 -->
          <button
            type="submit"
            :disabled="authStore.loading || !form.agree"
            class="w-full game-button"
            :class="{ 'opacity-50 cursor-not-allowed': authStore.loading || !form.agree }"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              註冊中...
            </span>
            <span v-else>開始冒險</span>
          </button>
        </form>

        <!-- 登入鏈接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            已經有帳號？
            <router-link
              to="/auth/login"
              class="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              立即登入
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

// 表單數據
const form = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

// 顯示密碼
const showPassword = ref(false)

// 表單驗證錯誤
const errors = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表單驗證
const validateForm = () => {
  let isValid = true

  // 重置錯誤
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  // 驗證用戶名
  if (!form.username.trim()) {
    errors.username = '請輸入用戶名'
    isValid = false
  } else if (form.username.length < 3 || form.username.length > 20) {
    errors.username = '用戶名長度應為3-20個字符'
    isValid = false
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = '用戶名只能包含字母、數字和下劃線'
    isValid = false
  }

  // 驗證暱稱
  if (form.nickname && form.nickname.length > 20) {
    errors.nickname = '暱稱不能超過20個字符'
    isValid = false
  }

  // 驗證郵箱
  if (form.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      errors.email = '請輸入有效的郵箱地址'
      isValid = false
    }
  }

  // 驗證密碼
  if (!form.password) {
    errors.password = '請輸入密碼'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密碼至少需要6個字符'
    isValid = false
  } else if (form.password.length > 50) {
    errors.password = '密碼不能超過50個字符'
    isValid = false
  }

  // 驗證確認密碼
  if (!form.confirmPassword) {
    errors.confirmPassword = '請確認密碼'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '兩次輸入的密碼不一致'
    isValid = false
  }

  return isValid
}

// 處理註冊
const handleRegister = async () => {
  if (!validateForm()) return

  const userData = {
    username: form.username.trim(),
    password: form.password
  }

  // 可選字段
  if (form.nickname.trim()) {
    userData.nickname = form.nickname.trim()
  }
  if (form.email.trim()) {
    userData.email = form.email.trim()
  }

  const result = await authStore.register(userData)

  if (result.success) {
    // 註冊成功，跳轉到遊戲地圖
    router.push('/game/map')
  }
}
</script>