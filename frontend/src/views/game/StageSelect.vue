<template>
  <div class="stage-select min-h-screen bg-japanese bg-sakura relative overflow-hidden">
    
    <!-- 游戏化背景装饰 -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- 远山层 -->
      <div class="absolute bottom-0 left-0 w-full h-40 opacity-10">
        <div class="w-full h-full bg-gradient-to-t from-blue-400 to-transparent"
             style="clip-path: polygon(0% 100%, 25% 80%, 50% 60%, 75% 85%, 100% 100%);"></div>
      </div>
      <!-- 装饰元素 -->
      <div class="absolute top-20 right-10 opacity-5 text-6xl animate-float">⛩️</div>
      <div class="absolute bottom-32 left-16 opacity-5 text-5xl animate-pulse-slow">🌸</div>
      <div class="absolute top-40 left-20 opacity-5 text-4xl animate-bounce-slow">🎋</div>
    </div>
    
    <!-- 顶部导航 - 玻璃拟态升级 -->
    <div class="glass-card border-b border-white/30 shadow-lg relative z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- 返回按钮 - 游戏化设计 -->
          <button @click="goBack" 
                  class="game-button-secondary flex items-center space-x-2 interactive">
            <span class="text-lg">←</span>
            <span>返回地图</span>
          </button>

          <!-- 区域标题 - 发光设计 -->
          <div class="text-center animate-fade-in-up">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {{ getAreaName() }}
            </h1>
            <p class="text-gray-700 mt-1">{{ getAreaDescription() }}</p>
          </div>

          <!-- 用户信息 - 3D效果 -->
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-700">{{ authStore.userNickname }}</p>
              <p class="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Lv.{{ authStore.userLevel }}
              </p>
            </div>
            <div class="flex items-center space-x-2 game-card px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
              <span class="text-xl animate-bounce-slow">💰</span>
              <span class="font-bold text-yellow-600 count-up">{{ authStore.userCoins }}</span>
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
      
      <!-- 区域进度概览 - 游戏化仪表盘 -->
      <div class="glass-card p-6 mb-8 border border-white/30 relative overflow-hidden animate-fade-in-up">
        <!-- 背景装饰 -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-bl-full"></div>
        <div class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-tr-full"></div>
        
        <div class="flex items-center justify-between mb-6 relative z-10">
          <h2 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎯 区域进度
          </h2>
          <div class="game-card px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50">
            <div class="text-sm font-medium text-gray-700">完成度</div>
            <div class="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent count-up">
              {{ Math.round(areaProgress.completed / areaProgress.total * 100) }}%
            </div>
          </div>
        </div>
        
        <!-- 进度条 - 发光动画版 -->
        <div class="progress-bar bg-gray-200/60 h-4 mb-6 relative z-10">
          <div class="progress-fill h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 relative overflow-hidden"
               :style="{ width: (areaProgress.completed / areaProgress.total * 100) + '%' }">
          </div>
        </div>
        
        <!-- 统计信息 - 3D卡片 -->
        <div class="grid grid-cols-3 gap-4 text-center relative z-10">
          <div class="stats-card group">
            <div class="stats-icon text-4xl mb-2 group-hover:animate-bounce-slow">✅</div>
            <div class="text-2xl font-bold text-blue-600 mb-1 count-up animate-scale-in">
              {{ areaProgress.completed }}
            </div>
            <div class="text-sm text-gray-600 font-medium">已完成</div>
            <div class="stats-glow bg-blue-500"></div>
          </div>
          
          <div class="stats-card group">
            <div class="stats-icon text-4xl mb-2 group-hover:animate-pulse-glow">⭐</div>
            <div class="text-2xl font-bold text-yellow-600 mb-1 count-up animate-scale-in animate-delay-100">
              {{ areaProgress.stars }}
            </div>
            <div class="text-sm text-gray-600 font-medium">获得星星</div>
            <div class="stats-glow bg-yellow-500"></div>
          </div>
          
          <div class="stats-card group star-sparkle">
            <div class="stats-icon text-4xl mb-2 group-hover:animate-float">🏆</div>
            <div class="text-2xl font-bold text-green-600 mb-1 count-up animate-scale-in animate-delay-200">
              {{ areaProgress.perfect }}
            </div>
            <div class="text-sm text-gray-600 font-medium">三星关卡</div>
            <div class="stats-glow bg-green-500"></div>
          </div>
        </div>
      </div>

      <!-- 关卡网格 - 游戏化卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="stage in stages" :key="stage.stage_id"
             class="stage-card game-stage-card"
             :class="{
               'stage-locked': !stage.unlocked,
               'stage-completed': stage.stars > 0,
               'stage-perfect': stage.stars === 3
             }"
             @click="selectStage(stage)">
          
          <!-- 关卡卡片 - 全新设计 -->
          <div class="game-card game-card-3d p-6 cursor-pointer relative overflow-hidden group transition-all duration-400">
            
            <!-- 状态指示器背景 -->
            <div v-if="!stage.unlocked" class="absolute inset-0 bg-gray-500/20 backdrop-blur-sm z-10 rounded-2xl"></div>
            <div v-else-if="stage.stars === 3" class="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-orange-200/20 z-0"></div>
            <div v-else-if="stage.stars > 0" class="absolute inset-0 bg-gradient-to-br from-green-200/20 via-transparent to-blue-200/20 z-0"></div>
            
            <!-- 锁定图标 (旋转动画) -->
            <div v-if="!stage.unlocked" class="absolute top-4 right-4 text-2xl opacity-60 animate-spin z-20" style="animation-duration: 3s;">
              🔒
            </div>
            
            <!-- 完美徽章 -->
            <div v-if="stage.stars === 3" class="absolute top-4 right-4 z-20">
              <div class="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse-glow">
                👑
              </div>
            </div>
            
            <!-- 关卡图标区域 -->
            <div class="text-center mb-4 relative z-10">
              <div class="text-6xl mb-3 group-hover:animate-bounce-slow transition-all duration-300" 
                   :class="{ 'grayscale opacity-50': !stage.unlocked }">
                {{ getStageIcon(stage) }}
              </div>
              <div class="text-xs font-bold uppercase tracking-wider" 
                   :class="stage.unlocked ? 'text-gray-600' : 'text-gray-400'">
                Stage {{ stage.stage_id }}
              </div>
            </div>
            
            <!-- 关卡信息 -->
            <div class="text-center mb-4 relative z-10">
              <h3 class="text-lg font-bold mb-2"
                  :class="stage.unlocked ? 'text-gray-800' : 'text-gray-400'">
                {{ stage.name_cn }}
              </h3>
              <p class="text-sm leading-relaxed"
                 :class="stage.unlocked ? 'text-gray-600' : 'text-gray-400'">
                {{ stage.description_cn }}
              </p>
            </div>
            
            <!-- 游戏类型标签 -->
            <div class="text-center mb-4 relative z-10">
              <span class="inline-block px-4 py-2 rounded-full text-xs font-medium"
                    :class="getGameTypeStyle(stage.game_type, stage.unlocked)">
                {{ getGameTypeName(stage.game_type) }}
              </span>
            </div>
            
            <!-- 星级显示 -->
            <div class="flex justify-center items-center space-x-1 mb-4 relative z-10">
              <span v-for="i in 3" :key="i" 
                    :class="i <= stage.stars ? 'text-yellow-400 animate-pulse' : 'text-gray-300'"
                    class="text-xl">
                ⭐
              </span>
            </div>
            
            <!-- 关卡状态和行动按钮 -->
            <div class="text-center relative z-10">
              <div v-if="!stage.unlocked" class="space-y-2">
                <div class="text-gray-500 text-sm font-medium">
                  🔒 尚未解锁
                </div>
                <div class="text-xs text-red-500">
                  {{ getUnlockHint(stage) }}
                </div>
              </div>
              
              <div v-else-if="stage.stars === 0" class="space-y-2">
                <button class="game-button text-sm px-6 py-2 animate-pulse-glow">
                  ⚔️ 开始挑战
                </button>
              </div>
              
              <div v-else class="space-y-2">
                <button class="game-button-secondary text-sm px-6 py-2">
                  🔄 再次挑战
                </button>
                <div class="text-xs text-green-600 font-medium">
                  ✅ 已完成
                </div>
              </div>
            </div>
            
            <!-- 最佳成绩 -->
            <div v-if="stage.best_score > 0" class="text-center mt-3 relative z-10">
              <div class="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                🏆 最佳: {{ stage.best_score }}分
              </div>
            </div>
            
            <!-- 边框发光效果 -->
            <div class="stage-glow"></div>
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

// 获取游戏类型名称
function getGameTypeName(gameType) {
  return gameTypeMap[gameType] || gameType
}

// 获取游戏类型样式
function getGameTypeStyle(gameType, unlocked) {
  const baseStyle = unlocked ? '' : 'opacity-50 '
  const styleMap = {
    'match_clear': baseStyle + 'bg-pink-100 text-pink-700 border border-pink-200',
    'word_battle': baseStyle + 'bg-red-100 text-red-700 border border-red-200',
    'voice_dojo': baseStyle + 'bg-blue-100 text-blue-700 border border-blue-200',
    'grammar_runner': baseStyle + 'bg-green-100 text-green-700 border border-green-200',
    'listening_shooter': baseStyle + 'bg-purple-100 text-purple-700 border border-purple-200'
  }
  return styleMap[gameType] || (baseStyle + 'bg-gray-100 text-gray-700 border border-gray-200')
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

// 加載關卡列表（從後端API獲取）
async function loadStages() {
  try {
    loading.value = true
    
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3002/api/stage/area/${props.areaId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    
    if (data.success && data.stages) {
      stages.value = data.stages
    } else {
      // API 失敗時的後備方案
      console.warn('從API獲取關卡失敗，使用空列表')
      stages.value = []
    }
    
  } catch (error) {
    console.error('加載關卡失敗:', error)
    gameStore.setError('加載關卡失敗')
    stages.value = []
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
/* === 关卡卡片样式 === */
.game-stage-card {
  transition: all 0.4s var(--ease-smooth);
}

.game-stage-card:not(.stage-locked) {
  cursor: pointer;
}

.game-stage-card:not(.stage-locked):hover {
  transform: translateY(-8px) scale(1.02);
  z-index: 10;
}

.game-stage-card.stage-locked {
  cursor: not-allowed;
  filter: grayscale(40%);
}

.game-stage-card.stage-locked:hover {
  transform: none;
}

/* 关卡状态样式 */
.game-stage-card.stage-completed .game-card {
  border: 2px solid rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.game-stage-card.stage-perfect .game-card {
  border: 3px solid rgba(251, 191, 36, 0.5);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 101, 101, 0.05) 100%);
  position: relative;
}

.game-stage-card.stage-perfect .game-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  border-radius: 20px;
  z-index: -1;
  animation: perfectGlow 2s ease-in-out infinite;
}

@keyframes perfectGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

/* 关卡发光效果 */
.stage-glow {
  position: absolute;
  inset: -3px;
  background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.2), transparent);
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: -1;
}

.game-stage-card:not(.stage-locked):hover .stage-glow {
  opacity: 1;
  animation: rotateGlow 3s linear infinite;
}

@keyframes rotateGlow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 完美关卡特效 */
.game-stage-card.stage-perfect .stage-glow {
  background: linear-gradient(45deg, transparent, rgba(251, 191, 36, 0.4), transparent);
}

/* 星星闪烁动画 */
@keyframes starSparkle {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8; 
  }
}

.stage-perfect .text-yellow-400 {
  animation: starSparkle 1.5s ease-in-out infinite;
}

/* 加载动画优化 */
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--game-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 统计卡片样式 (复用) */
.stats-card {
  position: relative;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  transition: all 0.3s var(--ease-smooth);
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stats-icon {
  transition: all 0.3s ease;
}

.stats-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.stats-card:hover .stats-glow {
  opacity: 0.8;
  box-shadow: 0 0 10px currentColor;
}

/* 数字计数动画 */
.count-up {
  animation: countUp 0.8s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 按钮悬浮效果增强 */
.game-stage-card .game-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.game-stage-card .game-button-secondary:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-md);
}

/* 游戏类型标签动画 */
.game-stage-card:hover [class*="bg-"][class*="-100"] {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* 锁定状态特殊动画 */
.stage-locked .animate-spin {
  animation-duration: 3s;
  animation-timing-function: ease-in-out;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .game-stage-card {
    margin-bottom: 1rem;
  }
  
  .game-stage-card .text-6xl {
    font-size: 4rem !important;
  }
  
  .game-stage-card .text-lg {
    font-size: 1rem !important;
  }
  
  .game-stage-card .text-sm {
    font-size: 0.8rem !important;
  }
  
  .game-stage-card:not(.stage-locked):hover {
    transform: translateY(-4px) scale(1.01);
  }
}

@media (max-width: 480px) {
  .game-stage-card .text-6xl {
    font-size: 3.5rem !important;
  }
  
  .game-card {
    padding: 1.2rem !important;
  }
}

/* 无障碍优化 - 减少动画 */
@media (prefers-reduced-motion: reduce) {
  .game-stage-card,
  .stats-card,
  .stage-glow,
  .count-up {
    animation: none !important;
    transition-duration: 0.1s !important;
  }
  
  .game-stage-card:hover {
    transform: none !important;
  }
}

/* 暗色主题支持 (预留) */
@media (prefers-color-scheme: dark) {
  .game-stage-card .game-card {
    background: rgba(30, 30, 30, 0.95);
    color: #f1f5f9;
  }
  
  .stats-card {
    background: rgba(30, 30, 30, 0.9);
    color: #f1f5f9;
  }
}
</style>