<template>
  <div class="gameplay-container">
    <!-- 加載中狀態 -->
    <div v-if="loading" class="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-xl text-gray-600">正在加載關卡...</p>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div class="text-center max-w-md mx-4">
        <div class="text-6xl mb-4">😕</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">關卡加載失敗</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <div class="flex space-x-4 justify-center">
          <button @click="loadStageConfig" 
                  class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            重試
          </button>
          <button @click="goBack" 
                  class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
            返回
          </button>
        </div>
      </div>
    </div>

    <!-- 動態遊戲組件 -->
    <component v-else-if="stageConfig && gameComponent" 
               :is="gameComponent" 
               :stage-config="stageConfig"
               @game-complete="handleGameComplete"
               @game-exit="handleGameExit" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

// 動態導入遊戲組件
import MatchClear from '@/components/games/MatchClear.vue'
import WordBattle from '@/components/games/WordBattle.vue'
import VoiceDojo from '@/components/games/VoiceDojo.vue'
import GrammarRunner from '@/components/games/GrammarRunner.vue'
import ListeningShooter from '@/components/games/ListeningShooter.vue'

// 路由和 store
const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

// 響應式數據
const loading = ref(true)
const error = ref('')
const stageConfig = ref(null)

// 路由參數
const areaId = computed(() => parseInt(route.params.areaId))
const stageId = computed(() => parseInt(route.params.stageId))

// 遊戲組件映射
const gameComponentMap = {
  'match_clear': MatchClear,
  'word_battle': WordBattle,
  'voice_dojo': VoiceDojo,
  'grammar_runner': GrammarRunner,
  'listening_shooter': ListeningShooter
}

// 計算當前遊戲組件
const gameComponent = computed(() => {
  if (!stageConfig.value) return null
  return gameComponentMap[stageConfig.value.game_type] || null
})

// 加載關卡配置
async function loadStageConfig() {
  try {
    loading.value = true
    error.value = ''

    // 驗證路由參數
    if (!areaId.value || !stageId.value || areaId.value < 1 || stageId.value < 1) {
      throw new Error('無效的關卡參數')
    }

    // 從 store 加載關卡配置
    const result = await gameStore.loadStageConfig(areaId.value, stageId.value)
    
    if (!result.success) {
      throw new Error('關卡配置加載失敗')
    }

    stageConfig.value = result.stage

    // 檢查遊戲類型是否支持
    if (!gameComponentMap[stageConfig.value.game_type]) {
      throw new Error(`遊戲類型 "${stageConfig.value.game_type}" 暫未實現`)
    }

  } catch (err) {
    console.error('加載關卡配置失敗:', err)
    error.value = err.message || '未知錯誤'
  } finally {
    loading.value = false
  }
}

// 遊戲完成處理
function handleGameComplete(result) {
  console.log('遊戲完成:', result)
  // 遊戲組件會自己處理結果提交，這裡可以添加額外的邏輯
}

// 遊戲退出處理
function handleGameExit() {
  goBack()
}

// 返回上一頁
function goBack() {
  router.push(`/game/area/${areaId.value}/stages`)
}

// 監聽路由變化
watch([() => route.params.areaId, () => route.params.stageId], () => {
  if (route.name === 'gamePlay') {
    loadStageConfig()
  }
}, { immediate: false })

// 生命週期
onMounted(() => {
  loadStageConfig()
})
</script>

<style scoped>
.gameplay-container {
  min-height: 100vh;
}

/* 加載動畫 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>