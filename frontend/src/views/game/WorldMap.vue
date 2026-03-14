<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-200 via-green-100 to-yellow-100">
    <!-- 頂部狀態欄 -->
    <div class="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- 用戶信息 -->
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
              {{ authStore.userNickname.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-bold text-gray-800">{{ authStore.userNickname }}</p>
              <p class="text-sm text-gray-600">{{ authStore.levelTitle }}</p>
            </div>
          </div>

          <!-- 等級和經驗 -->
          <div class="flex items-center space-x-4">
            <div class="text-center">
              <p class="text-xs text-gray-500">等級</p>
              <p class="font-bold text-lg text-secondary-600">{{ authStore.userLevel }}</p>
            </div>
            <div class="w-32">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>EXP</span>
                <span>{{ authStore.userExp }}</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: authStore.levelProgress + '%' }"
                ></div>
              </div>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-500">金幣</p>
              <p class="font-bold text-lg text-accent-600">{{ authStore.userCoins }}</p>
            </div>
          </div>

          <!-- 菜單按鈕 -->
          <div class="flex items-center space-x-2">
            <button 
              @click="showDailyTasks = true"
              class="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              :class="{ 'animate-pulse': hasUncompletedTasks }"
            >
              <div class="relative">
                📋
                <span v-if="hasUncompletedTasks" class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
            </button>
            
            <router-link 
              to="/user/profile"
              class="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              ⚙️
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 世界地圖 -->
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">日語冒險世界</h1>
        <p class="text-gray-600">選擇一個區域開始你的學習之旅</p>
        
        <!-- 總進度 -->
        <div class="mt-4 grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-sm text-gray-500">完成關卡</p>
            <p class="text-xl font-bold text-primary-600">{{ gameStore.completedStages }}</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-sm text-gray-500">獲得星星</p>
            <p class="text-xl font-bold text-accent-600">{{ gameStore.totalStars }}</p>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm">
            <p class="text-sm text-gray-500">掌握單詞</p>
            <p class="text-xl font-bold text-green-600">{{ gameStore.masteredWords }}</p>
          </div>
        </div>
      </div>

      <!-- 地圖區域 -->
      <div class="space-y-8">
        <!-- 逆序顯示，從試煉塔到五十音島 -->
        <div 
          v-for="area in areas.slice().reverse()" 
          :key="area.id"
          class="relative"
        >
          <!-- 連接線 -->
          <div 
            v-if="area.id < 6" 
            class="absolute left-1/2 transform -translate-x-1/2 -bottom-8 w-1 h-8 bg-gray-300"
            :class="{ 'bg-primary-400': isAreaUnlocked(area.id + 1) }"
          ></div>

          <!-- 區域卡片 -->
          <div 
            class="relative mx-auto max-w-sm cursor-pointer transform transition-all duration-300"
            :class="{ 
              'hover:scale-105': isAreaUnlocked(area.id),
              'opacity-50 cursor-not-allowed': !isAreaUnlocked(area.id)
            }"
            @click="handleAreaClick(area)"
          >
            <div 
              class="game-card p-6 text-center"
              :class="{ 
                'border-2 border-primary-300 shadow-lg': isAreaUnlocked(area.id),
                'border-gray-200': !isAreaUnlocked(area.id)
              }"
            >
              <!-- 鎖定圖標 -->
              <div 
                v-if="!isAreaUnlocked(area.id)" 
                class="absolute top-2 right-2 text-gray-400"
              >
                🔒
              </div>

              <!-- 區域圖標 -->
              <div class="text-6xl mb-4">{{ area.icon }}</div>

              <!-- 區域信息 -->
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ area.name }}</h3>
              <p class="text-sm text-gray-600 mb-4">{{ area.description }}</p>

              <!-- 學習目標 -->
              <div class="text-xs text-gray-500 mb-4">
                {{ area.goal }}
              </div>

              <!-- 進度條 -->
              <div v-if="isAreaUnlocked(area.id)" class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">進度</span>
                  <span class="text-sm font-medium">{{ getAreaProgress(area.id) }}%</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: getAreaProgress(area.id) + '%' }"
                  ></div>
                </div>
                
                <!-- 星星顯示 -->
                <div class="flex justify-center space-x-1 mt-2">
                  <span 
                    v-for="i in 3" 
                    :key="i"
                    class="text-xl"
                    :class="getAreaStars(area.id) >= i ? 'text-accent-500' : 'text-gray-300'"
                  >
                    ⭐
                  </span>
                </div>
              </div>

              <!-- 解鎖條件 -->
              <div v-else class="text-sm text-gray-500">
                需要完成「{{ areas[area.id - 2]?.name }}」才能解鎖
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 當前位置指示器（顯示在最後一個已解鎖的區域） -->
      <div class="mt-8 text-center">
        <div class="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full">
          <span class="mr-2">📍</span>
          你在這裡：{{ getCurrentArea()?.name }}
        </div>
      </div>
    </div>

    <!-- 每日任務彈窗 -->
    <DailyTasksModal 
      v-if="showDailyTasks"
      @close="showDailyTasks = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import DailyTasksModal from '@/components/DailyTasksModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

const showDailyTasks = ref(false)

// 區域數據
const areas = [
  {
    id: 1,
    name: '五十音島',
    icon: '🏝️',
    description: '日語的起點',
    goal: '學會92個假名',
    days: 'Day 1-7'
  },
  {
    id: 2,
    name: '單詞村',
    icon: '🏘️',
    description: '豐富詞彙庫',
    goal: '掌握800個單詞',
    days: 'Day 8-21'
  },
  {
    id: 3,
    name: '語法城',
    icon: '🏯',
    description: '語法的殿堂',
    goal: '學會82個語法',
    days: 'Day 22-35'
  },
  {
    id: 4,
    name: '會話廣場',
    icon: '🎪',
    description: '交流的舞台',
    goal: '掌握日常對話',
    days: 'Day 36-45'
  },
  {
    id: 5,
    name: '讀解森林',
    icon: '📖',
    description: '理解的迷宮',
    goal: '提升閱讀能力',
    days: 'Day 46-53'
  },
  {
    id: 6,
    name: 'N5試煉塔',
    icon: '🏆',
    description: '最終挑戰',
    goal: '通過N5考試',
    days: 'Day 54-60'
  }
]

// 計算是否有未完成的每日任務
const hasUncompletedTasks = computed(() => {
  return gameStore.dailyTasks.some(task => !task.completed)
})

// 檢查區域是否已解鎖
const isAreaUnlocked = (areaId) => {
  return gameStore.getAreaUnlockStatus(areaId)
}

// 計算區域進度百分比
const getAreaProgress = (areaId) => {
  const areaStages = gameStore.mapProgress[areaId] || {}
  const stageCount = 8 // 假設每個區域有8個關卡
  const completedStages = Object.values(areaStages).filter(stage => stage.stars > 0).length
  return Math.round((completedStages / stageCount) * 100)
}

// 計算區域星級
const getAreaStars = (areaId) => {
  const areaStages = gameStore.mapProgress[areaId] || {}
  const totalStars = Object.values(areaStages).reduce((sum, stage) => sum + (stage.stars || 0), 0)
  
  // 根據總星星數計算區域星級（24星滿分，8星=1級，16星=2級，24星=3級）
  if (totalStars >= 24) return 3
  if (totalStars >= 16) return 2
  if (totalStars >= 8) return 1
  return 0
}

// 獲取當前所在區域
const getCurrentArea = () => {
  for (let i = areas.length - 1; i >= 0; i--) {
    if (isAreaUnlocked(areas[i].id)) {
      return areas[i]
    }
  }
  return areas[0]
}

// 處理區域點擊
const handleAreaClick = (area) => {
  if (!isAreaUnlocked(area.id)) {
    // 區域未解鎖，顯示提示
    gameStore.setError(`需要完成「${areas[area.id - 2]?.name}」才能解鎖此區域`)
    return
  }

  // 跳轉到關卡選擇頁面
  router.push({
    name: 'stageSelect',
    params: { areaId: area.id }
  })
}

// 組件掛載時加載數據
onMounted(async () => {
  await Promise.all([
    gameStore.loadMapProgress(),
    gameStore.loadDailyTasks(),
    gameStore.loadUserProgress()
  ])
})
</script>