<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'

const authStore = useAuthStore()
const gameStore = useGameStore()

// 應用初始化
onMounted(async () => {
  // 檢查認證狀態
  await authStore.checkAuth()
  
  // 加載遊戲設置
  gameStore.loadGameSettings()
})
</script>

<template>
  <div id="app" class="min-h-screen">
    <!-- 全局錯誤提示 -->
    <div 
      v-if="gameStore.error" 
      class="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg"
    >
      <div class="flex items-center space-x-2">
        <span>⚠️</span>
        <span>{{ gameStore.error }}</span>
        <button 
          @click="gameStore.setError(null)"
          class="ml-2 text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </div>
    </div>

    <!-- 加載指示器 -->
    <div 
      v-if="authStore.loading || gameStore.loading"
      class="fixed top-4 left-4 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg shadow-lg"
    >
      <div class="flex items-center space-x-2">
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>載入中...</span>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <RouterView />
  </div>
</template>

<style>
/* 確保應用佔滿全屏 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 全局滾動條樣式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
