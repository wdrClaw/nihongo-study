<template>
  <div class="stage-select min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    <!-- 頂部導航 -->
    <div class="bg-white/80 backdrop-blur-sm shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- 返回按鈕 -->
          <button @click="goBack" 
                  class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <span>←</span>
            <span>返回地圖</span>
          </button>

          <!-- 區域標題 -->
          <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-800">{{ getAreaName() }}</h1>
            <p class="text-gray-600">{{ getAreaDescription() }}</p>
          </div>

          <!-- 用戶信息 -->
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-gray-600">{{ authStore.userNickname }}</p>
              <p class="text-sm font-bold text-blue-600">Lv.{{ authStore.userLevel }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span>💰</span>
              <span class="font-bold text-yellow-600">{{ authStore.userCoins }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加載狀態 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600">加載關卡中...</p>
      </div>
    </div>

    <!-- 關卡列表 -->
    <div v-else class="max-w-4xl mx-auto px-4 py-8">
      
      <!-- 區域進度概覽 -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-800">區域進度</h2>
          <div class="text-sm text-gray-600">
            完成度: {{ Math.round(areaProgress.completed / areaProgress.total * 100) }}%
          </div>
        </div>
        
        <!-- 進度條 -->
        <div class="bg-gray-200 rounded-full h-3 mb-4">
          <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
               :style="{ width: (areaProgress.completed / areaProgress.total * 100) + '%' }">
          </div>
        </div>
        
        <!-- 統計信息 -->
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ areaProgress.completed }}</div>
            <div class="text-sm text-gray-600">已完成</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-yellow-600">{{ areaProgress.stars }}</div>
            <div class="text-sm text-gray-600">獲得星星</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ areaProgress.perfect }}</div>
            <div class="text-sm text-gray-600">三星關卡</div>
          </div>
        </div>
      </div>

      <!-- 關卡網格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="stage in stages" :key="stage.stage_id"
             class="stage-card"
             :class="{
               'locked': !stage.unlocked,
               'completed': stage.stars > 0,
               'perfect': stage.stars === 3
             }"
             @click="selectStage(stage)">
          
          <!-- 關卡卡片 -->
          <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            
            <!-- 關卡圖標 -->
            <div class="text-center mb-4">
              <div class="text-5xl mb-2">{{ getStageIcon(stage) }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">
                第{{ stage.stage_id }}關
              </div>
            </div>
            
            <!-- 關卡信息 -->
            <div class="text-center mb-4">
              <h3 class="text-lg font-bold text-gray-800 mb-2">{{ stage.name_cn }}</h3>
              <p class="text-sm text-gray-600 leading-relaxed">{{ stage.description_cn }}</p>
            </div>
            
            <!-- 遊戲類型標籤 -->
            <div class="text-center mb-4">
              <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {{ getGameTypeName(stage.game_type) }}
              </span>
            </div>
            
            <!-- 星級顯示 -->
            <div class="flex justify-center items-center space-x-1 mb-4">
              <span v-for="i in 3" :key="i" 
                    :class="i <= stage.stars ? 'text-yellow-500' : 'text-gray-300'"
                    class="text-lg">
                ⭐
              </span>
            </div>
            
            <!-- 關卡狀態 -->
            <div class="text-center">
              <div v-if="!stage.unlocked" class="text-gray-400 text-sm">
                🔒 尚未解鎖
              </div>
              <div v-else-if="stage.stars === 0" class="text-blue-600 text-sm font-medium">
                ▶️ 開始挑戰
              </div>
              <div v-else class="text-green-600 text-sm font-medium">
                ✅ 已完成 · 再次挑戰
              </div>
            </div>
            
            <!-- 最佳成績 -->
            <div v-if="stage.best_score > 0" class="text-center mt-2">
              <span class="text-xs text-gray-500">
                最佳: {{ stage.best_score }}分
              </span>
            </div>
            
            <!-- 解鎖條件提示 -->
            <div v-if="!stage.unlocked" class="text-center mt-2">
              <span class="text-xs text-red-500">
                {{ getUnlockHint(stage) }}
              </span>
            </div>
            
          </div>
        </div>
      </div>

      <!-- 暫無關卡提示 -->
      <div v-if="stages.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">🏗️</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">關卡建設中</h3>
        <p class="text-gray-600">這個區域的關卡正在開發中，敬請期待！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'

// Props
const props = defineProps({
  areaId: {
    type: [String, Number],
    required: true
  }
})

// Stores and Router
const gameStore = useGameStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// 響應式數據
const loading = ref(true)
const stages = ref([])

// 計算屬性
const areaProgress = computed(() => {
  let completed = 0
  let stars = 0
  let perfect = 0
  
  stages.value.forEach(stage => {
    if (stage.stars > 0) completed++
    stars += stage.stars
    if (stage.stars === 3) perfect++
  })
  
  return {
    completed,
    total: stages.value.length,
    stars,
    perfect
  }
})

// 區域映射
const areaMap = {
  1: { name: '五十音島 🏝️', description: '學習假名的起點', icon: '🏝️' },
  2: { name: '單詞村 🏘️', description: '收集詞彙的寶庫', icon: '🏘️' },
  3: { name: '語法城 🏯', description: '掌握語法的要塞', icon: '🏯' },
  4: { name: '會話廣場 🎪', description: '練習對話的舞台', icon: '🎪' },
  5: { name: '讀解森林 📖', description: '提升理解的森林', icon: '📖' },
  6: { name: 'N5試煉塔 🏆', description: '最終挑戰的高塔', icon: '🏆' }
}

const gameTypeMap = {
  'match_clear': '假名消消樂',
  'word_battle': '單詞BOSS戰', 
  'voice_dojo': '語音道場',
  'grammar_runner': '語法跑酷',
  'listening_shooter': '聽力射擊'
}

// 獲取區域名稱
function getAreaName() {
  return areaMap[props.areaId]?.name || `區域 ${props.areaId}`
}

// 獲取區域描述
function getAreaDescription() {
  return areaMap[props.areaId]?.description || '探索未知的領域'
}

// 獲取關卡圖標
function getStageIcon(stage) {
  const iconMap = {
    'match_clear': '🎴',
    'word_battle': '⚔️',
    'voice_dojo': '🎤',
    'grammar_runner': '🏃',
    'listening_shooter': '🎯'
  }
  return iconMap[stage.game_type] || '🎮'
}

// 獲取遊戲類型名稱
function getGameTypeName(gameType) {
  return gameTypeMap[gameType] || gameType
}

// 獲取解鎖提示
function getUnlockHint(stage) {
  if (stage.stage_id === 1) {
    return '需要完成前一區域'
  } else {
    return '需要完成前一關'
  }
}

// 選擇關卡
function selectStage(stage) {
  if (!stage.unlocked) {
    gameStore.setError('關卡尚未解鎖')
    return
  }
  
  // 跳轉到遊戲頁面
  router.push(`/game/area/${props.areaId}/stage/${stage.stage_id}`)
}

// 返回世界地圖
function goBack() {
  router.push('/game/map')
}

// 加載關卡列表
async function loadStages() {
  try {
    loading.value = true
    
    // 模擬關卡數據（實際應從 API 獲取）
    const mockStages = []
    
    // 根據區域生成不同的關卡
    if (props.areaId == 1) {
      // 五十音島
      mockStages.push(
        { stage_id: 1, name_cn: '假名入門', description_cn: '學習あいうえお五個基礎假名', game_type: 'match_clear', unlocked: true, stars: 0, best_score: 0 },
        { stage_id: 2, name_cn: '基音之舞', description_cn: '掌握か行假名', game_type: 'match_clear', unlocked: false, stars: 0, best_score: 0 },
        { stage_id: 3, name_cn: '清音挑戰', description_cn: '學習さ行和た行', game_type: 'match_clear', unlocked: false, stars: 0, best_score: 0 },
        { stage_id: 4, name_cn: '初音試煉', description_cn: '第一次語音練習', game_type: 'voice_dojo', unlocked: false, stars: 0, best_score: 0 },
        { stage_id: 5, name_cn: '假名大會戰', description_cn: '平假名片假名配對', game_type: 'match_clear', unlocked: false, stars: 0, best_score: 0 },
        { stage_id: 6, name_cn: '迷路貓救援', description_cn: '幫助迷路的小貓回家', game_type: 'word_battle', unlocked: false, stars: 0, best_score: 0 },
        { stage_id: 7, name_cn: '五十音終極試煉', description_cn: '混合配對大挑戰', game_type: 'match_clear', unlocked: false, stars: 0, best_score: 0 }
      )
    } else if (props.areaId == 2) {
      // 單詞村
      mockStages.push(
        { stage_id: 1, name_cn: '動物園大冒險', description_cn: '學習動物類單詞', game_type: 'word_battle', unlocked: false, stars: 0, best_score: 0 },
        { stage_id: 2, name_cn: '美食天堂', description_cn: '掌握食物詞彙', game_type: 'word_battle', unlocked: false, stars: 0, best_score: 0 },
        { stage_id: 3, name_cn: '家族聚會', description_cn: '學習家庭成員稱呼', game_type: 'word_battle', unlocked: false, stars: 0, best_score: 0 },
        { stage_id: 4, name_cn: '彩色世界', description_cn: '認識顏色詞彙', game_type: 'word_battle', unlocked: false, stars: 0, best_score: 0 },
        { stage_id: 5, name_cn: '壽司大將挑戰', description_cn: '與壽司大將的決戰', game_type: 'word_battle', unlocked: false, stars: 0, best_score: 0 }
      )
    }
    
    // 從 store 獲取用戶進度並更新關卡狀態
    await gameStore.loadMapProgress()
    
    const userProgress = gameStore.mapProgress[props.areaId] || {}
    
    stages.value = mockStages.map(stage => {
      const progress = userProgress[stage.stage_id]
      return {
        ...stage,
        unlocked: gameStore.getStageUnlockStatus(props.areaId, stage.stage_id),
        stars: progress?.stars || 0,
        best_score: progress?.best_score || 0
      }
    })
    
  } catch (error) {
    console.error('加載關卡失敗:', error)
    gameStore.setError('加載關卡失敗')
  } finally {
    loading.value = false
  }
}

// 生命週期
onMounted(() => {
  loadStages()
})
</script>

<style scoped>
/* 關卡卡片樣式 */
.stage-card {
  transition: all 0.3s ease;
}

.stage-card:not(.locked):hover {
  transform: translateY(-4px);
}

.stage-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.stage-card.locked:hover {
  transform: none;
}

.stage-card.completed {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
}

.stage-card.perfect {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 101, 101, 0.1) 100%);
}

/* 動畫 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 響應式 */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .stage-card .text-5xl {
    font-size: 3rem;
  }
}
</style>