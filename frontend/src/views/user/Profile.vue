<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 頂部導航 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center space-x-4">
          <button
            @click="$router.back()"
            class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <h1 class="text-xl font-bold text-gray-800">個人資料</h1>
        </div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- 用戶基本信息 -->
      <div class="game-card p-6 mb-6">
        <div class="flex items-center space-x-6">
          <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {{ authStore.userNickname.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800">{{ authStore.userNickname }}</h2>
            <p class="text-gray-600">{{ authStore.levelTitle }}</p>
            <p class="text-sm text-gray-500">用戶名：{{ authStore.user?.username }}</p>
          </div>
          <div class="text-right">
            <button class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              編輯資料
            </button>
          </div>
        </div>
      </div>

      <!-- 遊戲統計 -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="game-card p-4 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ authStore.userLevel }}</div>
          <div class="text-sm text-gray-500">等級</div>
        </div>
        <div class="game-card p-4 text-center">
          <div class="text-2xl font-bold text-accent-600">{{ authStore.userCoins }}</div>
          <div class="text-sm text-gray-500">金幣</div>
        </div>
        <div class="game-card p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ gameStore.totalStars }}</div>
          <div class="text-sm text-gray-500">星星</div>
        </div>
        <div class="game-card p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ gameStore.completedStages }}</div>
          <div class="text-sm text-gray-500">關卡</div>
        </div>
      </div>

      <!-- 學習進度 -->
      <div class="game-card p-6 mb-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">學習進度</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-600">單詞掌握</span>
              <span class="text-sm font-medium">{{ gameStore.masteredWords }}/800</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (gameStore.masteredWords / 800) * 100 + '%' }"
              ></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-600">語法掌握</span>
              <span class="text-sm font-medium">{{ gameStore.masteredGrammar }}/82</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (gameStore.masteredGrammar / 82) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 遊戲設置 -->
      <div class="game-card p-6 mb-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">遊戲設置</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-700">音效</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="gameStore.gameSettings.soundEnabled"
                type="checkbox" 
                class="sr-only peer"
                @change="gameStore.saveGameSettings()"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700">背景音樂</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="gameStore.gameSettings.musicEnabled"
                type="checkbox" 
                class="sr-only peer"
                @change="gameStore.saveGameSettings()"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700">語音識別</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="gameStore.gameSettings.voiceEnabled"
                type="checkbox" 
                class="sr-only peer"
                @change="gameStore.saveGameSettings()"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="grid md:grid-cols-2 gap-4">
        <router-link 
          to="/user/tasks"
          class="game-button text-center"
        >
          📋 每日任務
        </router-link>
        <button 
          @click="handleLogout"
          class="px-6 py-3 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300"
        >
          登出
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

// 處理登出
const handleLogout = () => {
  if (confirm('確定要登出嗎？')) {
    authStore.logout()
    router.push('/')
  }
}
</script>