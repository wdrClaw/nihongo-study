<template>
  <!-- 移动端专业注册页 - Duolingo 级设计 -->
  <div class="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary flex items-center justify-center p-5 relative overflow-hidden">
    
    <!-- 樱花飘落装饰 -->
    <div class="bg-sakura absolute inset-0 pointer-events-none z-0"></div>
    
    <div class="max-w-sm w-full relative z-10">
      <!-- Logo 和标题 - 移动端优化 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6 ring-4 ring-primary-100">
          <span class="text-4xl">🌸</span>
        </div>
        <h1 class="text-2xl font-bold text-text-primary mb-3 tracking-wide">创建账号</h1>
        <p class="text-text-secondary text-sm">开始你的日语学习冒险 ✨</p>
      </div>

      <!-- 注册表单卡片 - iPhone 适配 -->
      <div class="bg-white rounded-2xl p-6 shadow-lg border border-primary-100 backdrop-blur-sm">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- 用户名 - 移动端优化 -->
          <div>
            <label for="username" class="block text-sm font-semibold text-text-primary mb-2">
              用户名 *
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

          <!-- 昵称 - 移动端优化 -->
          <div>
            <label for="nickname" class="block text-sm font-semibold text-text-primary mb-2">
              昵称（可选）
            </label>
            <input
              id="nickname"
              v-model="form.nickname"
              type="text"
              class="w-full h-[52px] px-4 py-3 border border-gray-200 rounded-xl text-base bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300 outline-none"
              :class="{ 'border-error focus:border-error focus:ring-red-100': errors.nickname }"
              placeholder="在游戏中显示的名称"
            >
            <p v-if="errors.nickname" class="mt-2 text-sm text-error">{{ errors.nickname }}</p>
          </div>

          <!-- 邮箱 - 移动端优化 -->
          <div>
            <label for="email" class="block text-sm font-semibold text-text-primary mb-2">
              邮箱（可选）
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="w-full h-[52px] px-4 py-3 border border-gray-200 rounded-xl text-base bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300 outline-none"
              :class="{ 'border-error focus:border-error focus:ring-red-100': errors.email }"
              placeholder="用于找回密码和通知"
              autocomplete="email"
            >
            <p v-if="errors.email" class="mt-2 text-sm text-error">{{ errors.email }}</p>
          </div>

          <!-- 密码 - 移动端优化 -->
          <div>
            <label for="password" class="block text-sm font-semibold text-text-primary mb-2">
              密码 *
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full h-[52px] px-4 py-3 pr-12 border border-gray-200 rounded-xl text-base bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300 outline-none"
                :class="{ 'border-error focus:border-error focus:ring-red-100': errors.password }"
                placeholder="至少6个字符"
                autocomplete="new-password"
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

          <!-- 确认密码 - 移动端优化 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-semibold text-text-primary mb-2">
              确认密码 *
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full h-[52px] px-4 py-3 border border-gray-200 rounded-xl text-base bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all duration-300 outline-none"
              :class="{ 'border-error focus:border-error focus:ring-red-100': errors.confirmPassword }"
              placeholder="再次输入密码"
              autocomplete="new-password"
            >
            <p v-if="errors.confirmPassword" class="mt-2 text-sm text-error">{{ errors.confirmPassword }}</p>
          </div>

          <!-- 服务条款 - 移动端触控优化 -->
          <div class="flex items-start space-x-3 py-2">
            <input
              id="agree"
              v-model="form.agree"
              type="checkbox"
              required
              class="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-primary-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
            <label for="agree" class="text-sm text-text-secondary leading-relaxed">
              我已阅读并同意
              <a href="#" class="text-primary-400 hover:text-primary-500 font-medium underline decoration-dotted">服务条款</a>
              和
              <a href="#" class="text-primary-400 hover:text-primary-500 font-medium underline decoration-dotted">隐私政策</a>
            </label>
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

          <!-- 注册按钮 - iPhone 触控标准 -->
          <button
            type="submit"
            :disabled="authStore.loading || !form.agree"
            class="w-full h-[52px] bg-gradient-to-r from-primary-400 to-primary-500 text-white text-base font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center touch-target"
            :class="{ 
              'opacity-50 cursor-not-allowed': authStore.loading || !form.agree,
              'hover:from-primary-500 hover:to-primary-600 hover:shadow-xl hover:-translate-y-1 active:translate-y-0': !authStore.loading && form.agree
            }"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              注册中...
            </span>
            <span v-else class="flex items-center">
              开始冒险 
              <span class="ml-2">🚀</span>
            </span>
          </button>
        </form>

        <!-- 登录链接 - 移动端居中 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-text-secondary">
            已有账号？
            <router-link
              to="/auth/login"
              class="font-semibold text-primary-400 hover:text-primary-500 transition-colors ml-1"
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