<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-100 to-white">
    <!-- 頂部導航 -->
    <div class="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="$router.push('/game/map')"
              class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-xl font-bold text-gray-800">{{ currentArea?.name }}</h1>
              <p class="text-sm text-gray-600">{{ currentArea?.description }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="text-center">
              <p class="text-xs text-gray-500">等級</p>
              <p class="font-bold text-secondary-600">{{ authStore.userLevel }}</p>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-500">金幣</p>
              <p class="font-bold text-accent-600">{{ authStore.userCoins }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 區域信息卡片 -->
    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="game-card p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="text-4xl">{{ currentArea?.icon }}</div>
            <div>
              <h2 class="text-2xl font-bold text-gray-800">{{ currentArea?.name }}</h2>
              <p class="text-gray-600 mt-1">{{ currentArea?.goal }}</p>
              <p class="text-sm text-gray-500 mt-1">學習時間：{{ currentArea?.days }}</p>
            </div>
          </div>

          <!-- 區域進度 -->
          <div class="text-center">
            <p class="text-sm text-gray-500 mb-2">完成度</p>
            <div class="w-20 h-20 relative">
              <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  stroke-width="2"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="2"
                  stroke-dasharray="{{ areaProgress }}, 100"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-gray-800">{{ areaProgress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 關卡路徑 -->
      <div class="relative">
        <!-- 關卡網格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="stage in stages"
            :key="stage.id"
            class="relative"
          >
            <!-- 關卡卡片 -->
            <div
              class="game-card p-6 cursor-pointer transform transition-all duration-300"
              :class="{
                'hover:scale-105 border-2 border-primary-300': isStageUnlocked(stage.id),
                'opacity-60 cursor-not-allowed': !isStageUnlocked(stage.id),
                'bg-green-50 border-green-300': isStageCompleted(stage.id)
              }"
              @click="handleStageClick(stage)"
            >
              <!-- 鎖定圖標 -->
              <div 
                v-if="!isStageUnlocked(stage.id)" 
                class="absolute top-3 right-3 text-gray-400"
              >
                🔒
              </div>

              <!-- 完成標記 -->
              <div 
                v-if="isStageCompleted(stage.id)" 
                class="absolute top-3 right-3 text-green-500"
              >
                ✅
              </div>

              <!-- 關卡標題 -->
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {{ stage.id }}
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">{{ stage.title }}</h3>
                  <p class="text-sm text-gray-600">{{ getGameTypeName(stage.game_type) }}</p>
                </div>
              </div>

              <!-- 關卡描述 -->
              <p class="text-gray-600 mb-4">{{ stage.description }}</p>

              <!-- 學習內容 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="tag in stage.tags"
                  :key="tag"
                  class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- 關卡統計 -->
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p class="text-xs text-gray-500">難度</p>
                  <div class="flex justify-center space-x-1 mt-1">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="w-2 h-2 rounded-full"
                      :class="i <= stage.difficulty ? 'bg-red-400' : 'bg-gray-200'"
                    ></span>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500">預計時間</p>
                  <p class="text-sm font-medium">{{ stage.estimated_time }}分</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">星級</p>
                  <div class="flex justify-center space-x-1 mt-1">
                    <span
                      v-for="i in 3"
                      :key="i"
                      class="text-sm"
                      :class="getStageStars(stage.id) >= i ? 'text-accent-500' : 'text-gray-300'"
                    >
                      ⭐
                    </span>
                  </div>
                </div>
              </div>

              <!-- 解鎖條件 -->
              <div v-if="!isStageUnlocked(stage.id)" class="mt-4 text-center">
                <p class="text-xs text-gray-500">
                  需要完成關卡 {{ stage.id - 1 }}
                </p>
              </div>

              <!-- 行動按鈕 -->
              <div v-if="isStageUnlocked(stage.id)" class="mt-4">
                <button
                  class="w-full game-button"
                  @click.stop="handleStageClick(stage)"
                >
                  {{ isStageCompleted(stage.id) ? '重新挑戰' : '開始挑戰' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BOSS關卡提示 -->
      <div v-if="hasBossStage" class="mt-8">
        <div class="bg-gradient-to-r from-red-100 to-orange-100 border border-red-200 rounded-xl p-6">
          <div class="flex items-center space-x-4">
            <div class="text-4xl">👹</div>
            <div>
              <h3 class="text-lg font-bold text-red-800">BOSS挑戰</h3>
              <p class="text-red-700">完成所有關卡後解鎖終極BOSS戰！</p>
              <p class="text-sm text-red-600 mt-1">擊敗BOSS可獲得大量經驗和稀有獎勵</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

const areaId = parseInt(route.params.areaId)

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

// 模擬關卡數據（實際應從後端獲取）
const stages = ref([
  {
    id: 1,
    title: '假名消消樂 - あ行',
    description: '學習日語最基礎的五個假名',
    game_type: 'match',
    difficulty: 1,
    estimated_time: 5,
    tags: ['あ', 'い', 'う', 'え', 'お']
  },
  {
    id: 2,
    title: '假名消消樂 - か行',
    description: '掌握か行的五個假名',
    game_type: 'match',
    difficulty: 2,
    estimated_time: 6,
    tags: ['か', 'き', 'く', 'け', 'こ']
  },
  {
    id: 3,
    title: '語音道場 - 發音練習',
    description: '練習已學假名的正確發音',
    game_type: 'voice',
    difficulty: 2,
    estimated_time: 8,
    tags: ['發音', 'あ行', 'か行']
  },
  {
    id: 4,
    title: '假名消消樂 - さ行',
    description: '學習さ行假名',
    game_type: 'match',
    difficulty: 2,
    estimated_time: 6,
    tags: ['さ', 'し', 'す', 'せ', 'そ']
  },
  {
    id: 5,
    title: '假名消消樂 - た行',
    description: '學習た行假名',
    game_type: 'match',
    difficulty: 2,
    estimated_time: 6,
    tags: ['た', 'ち', 'つ', 'て', 'と']
  },
  {
    id: 6,
    title: '綜合復習',
    description: '復習所有已學假名',
    game_type: 'match',
    difficulty: 3,
    estimated_time: 10,
    tags: ['復習', '混合練習']
  },
  {
    id: 7,
    title: '假名消消樂 - 極限模式',
    description: '挑戰極限模式，測試你的假名掌握程度',
    game_type: 'match',
    difficulty: 4,
    estimated_time: 8,
    tags: ['極限模式', '計時挑戰']
  },
  {
    id: 8,
    title: 'BOSS戰 - 文盲大王',
    description: '擊敗五十音島的守護BOSS',
    game_type: 'boss',
    difficulty: 5,
    estimated_time: 12,
    tags: ['BOSS', '最終挑戰']
  }
])

// 計算屬性
const currentArea = computed(() => areas.find(area => area.id === areaId))

const areaProgress = computed(() => {
  const completedStages = stages.value.filter(stage => isStageCompleted(stage.id)).length
  return Math.round((completedStages / stages.value.length) * 100)
})

const hasBossStage = computed(() => {
  return stages.value.some(stage => stage.game_type === 'boss')
})

// 方法
const isStageUnlocked = (stageId) => {
  return gameStore.getStageUnlockStatus(areaId, stageId)
}

const isStageCompleted = (stageId) => {
  return gameStore.getStageStars(areaId, stageId) > 0
}

const getStageStars = (stageId) => {
  return gameStore.getStageStars(areaId, stageId)
}

const getGameTypeName = (gameType) => {
  const names = {
    match: '消消樂',
    boss: 'BOSS戰',
    voice: '語音道場',
    runner: '語法跑酷',
    shooter: '聽力射擊',
    exam: '模擬考試'
  }
  return names[gameType] || '未知'
}

const handleStageClick = (stage) => {
  if (!isStageUnlocked(stage.id)) {
    gameStore.setError(`需要完成關卡 ${stage.id - 1} 才能解鎖此關卡`)
    return
  }

  // 跳轉到遊戲頁面
  router.push({
    name: 'gamePlay',
    params: {
      areaId: areaId,
      stageId: stage.id
    }
  })
}

// 組件掛載時加載數據
onMounted(async () => {
  await gameStore.loadMapProgress()
})
</script>