<template>
  <div class="world-map min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 relative overflow-hidden">
    
    <!-- 背景雲朵動畫 -->
    <div class="absolute inset-0 pointer-events-none">
      <div v-for="i in 6" :key="i" 
           class="absolute text-white/30 animate-float"
           :style="{ 
             left: Math.random() * 80 + '%',
             top: Math.random() * 60 + '%',
             fontSize: Math.random() * 2 + 1 + 'rem',
             animationDelay: Math.random() * 5 + 's',
             animationDuration: (Math.random() * 3 + 4) + 's'
           }">
        ☁️
      </div>
    </div>

    <!-- 頂部狀態欄 -->
    <div class="relative z-10 bg-white/80 backdrop-blur-sm shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          
          <!-- 遊戲標題 -->
          <div class="flex items-center space-x-3">
            <div class="text-3xl">🎌</div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Nihongo Quest</h1>
              <p class="text-sm text-gray-600">日語冒險之旅</p>
            </div>
          </div>

          <!-- 用戶信息 -->
          <div class="flex items-center space-x-6">
            
            <!-- 用戶頭像和等級 -->
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl">
                {{ authStore.userNickname?.charAt(0) || '冒' }}
              </div>
              <div>
                <p class="font-bold text-gray-800">{{ authStore.userNickname }}</p>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-purple-600 font-bold">{{ authStore.levelTitle }}</span>
                  <span class="text-sm text-gray-500">Lv.{{ authStore.userLevel }}</span>
                </div>
              </div>
            </div>

            <!-- 經驗值條 -->
            <div class="hidden md:block w-32">
              <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>EXP</span>
                <span>{{ authStore.levelProgress.toFixed(0) }}%</span>
              </div>
              <div class="bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                     :style="{ width: authStore.levelProgress + '%' }">
                </div>
              </div>
            </div>

            <!-- 金幣 -->
            <div class="flex items-center space-x-2">
              <span class="text-2xl">💰</span>
              <span class="text-xl font-bold text-yellow-600">{{ authStore.userCoins.toLocaleString() }}</span>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- 地圖主體 -->
    <div class="relative z-10 max-w-6xl mx-auto px-4 py-8">
      
      <!-- 學習進度概覽 -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div class="text-3xl font-bold text-blue-600 mb-1">{{ gameStore.totalStars }}</div>
            <div class="text-sm text-gray-600">總星星數</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-green-600 mb-1">{{ gameStore.completedStages }}</div>
            <div class="text-sm text-gray-600">完成關卡</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-yellow-600 mb-1">{{ gameStore.masteredWords }}</div>
            <div class="text-sm text-gray-600">掌握單詞</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-purple-600 mb-1">{{ authStore.user?.consecutive_days || 0 }}</div>
            <div class="text-sm text-gray-600">連續學習</div>
          </div>
        </div>
      </div>

      <!-- 地圖路徑 -->
      <div class="map-path relative">
        
        <!-- 連接線 -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 1;">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- 從五十音島到單詞村 -->
          <path d="M 300 650 Q 350 600 400 550" stroke="url(#pathGradient)" stroke-width="4" fill="none" opacity="0.6" stroke-dasharray="10,5"/>
          
          <!-- 從單詞村到語法城 -->
          <path d="M 400 550 Q 450 500 500 450" stroke="url(#pathGradient)" stroke-width="4" fill="none" opacity="0.6" stroke-dasharray="10,5"/>
          
          <!-- 從語法城到會話廣場 -->
          <path d="M 500 450 Q 550 400 600 350" stroke="url(#pathGradient)" stroke-width="4" fill="none" opacity="0.6" stroke-dasharray="10,5"/>
          
          <!-- 從會話廣場到讀解森林 -->
          <path d="M 600 350 Q 650 300 700 250" stroke="url(#pathGradient)" stroke-width="4" fill="none" opacity="0.6" stroke-dasharray="10,5"/>
          
          <!-- 從讀解森林到試煉塔 -->
          <path d="M 700 250 Q 750 200 800 150" stroke="url(#pathGradient)" stroke-width="4" fill="none" opacity="0.6" stroke-dasharray="10,5"/>
        </svg>

        <!-- 區域節點 -->
        <div class="areas-container relative" style="height: 800px; z-index: 2;">
          
          <!-- 五十音島 (起點) -->
          <div class="area-node" :class="{ unlocked: isAreaUnlocked(1), current: currentArea === 1 }"
               style="position: absolute; left: 50px; bottom: 80px;"
               @click="selectArea(1)">
            <div class="area-card">
              <div class="area-icon text-6xl mb-3">🏝️</div>
              <h3 class="area-title">五十音島</h3>
              <p class="area-subtitle">Day 1-7</p>
              <div class="area-progress">
                <div class="stars-display">
                  {{ getAreaStars(1) }}/21 ⭐
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (getAreaStars(1) / 21 * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 單詞村 -->
          <div class="area-node" :class="{ unlocked: isAreaUnlocked(2), current: currentArea === 2 }"
               style="position: absolute; left: 200px; bottom: 300px;"
               @click="selectArea(2)">
            <div class="area-card">
              <div class="area-icon text-6xl mb-3">🏘️</div>
              <h3 class="area-title">單詞村</h3>
              <p class="area-subtitle">Day 8-21</p>
              <div class="area-progress">
                <div class="stars-display">
                  {{ getAreaStars(2) }}/15 ⭐
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (getAreaStars(2) / 15 * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 語法城 -->
          <div class="area-node" :class="{ unlocked: isAreaUnlocked(3), current: currentArea === 3 }"
               style="position: absolute; left: 350px; bottom: 500px;"
               @click="selectArea(3)">
            <div class="area-card">
              <div class="area-icon text-6xl mb-3">🏯</div>
              <h3 class="area-title">語法城</h3>
              <p class="area-subtitle">Day 22-35</p>
              <div class="area-progress">
                <div class="stars-display">
                  {{ getAreaStars(3) }}/18 ⭐
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (getAreaStars(3) / 18 * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 會話廣場 -->
          <div class="area-node" :class="{ unlocked: isAreaUnlocked(4), current: currentArea === 4 }"
               style="position: absolute; right: 200px; bottom: 400px;"
               @click="selectArea(4)">
            <div class="area-card">
              <div class="area-icon text-6xl mb-3">🎪</div>
              <h3 class="area-title">會話廣場</h3>
              <p class="area-subtitle">Day 36-45</p>
              <div class="area-progress">
                <div class="stars-display">
                  {{ getAreaStars(4) }}/12 ⭐
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (getAreaStars(4) / 12 * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 讀解森林 -->
          <div class="area-node" :class="{ unlocked: isAreaUnlocked(5), current: currentArea === 5 }"
               style="position: absolute; right: 180px; bottom: 600px;"
               @click="selectArea(5)">
            <div class="area-card">
              <div class="area-icon text-6xl mb-3">📖</div>
              <h3 class="area-title">讀解森林</h3>
              <p class="area-subtitle">Day 46-53</p>
              <div class="area-progress">
                <div class="stars-display">
                  {{ getAreaStars(5) }}/9 ⭐
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (getAreaStars(5) / 9 * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- N5試煉塔 -->
          <div class="area-node" :class="{ unlocked: isAreaUnlocked(6), current: currentArea === 6 }"
               style="position: absolute; right: 50px; top: 30px;"
               @click="selectArea(6)">
            <div class="area-card final-area">
              <div class="area-icon text-6xl mb-3">🏆</div>
              <h3 class="area-title">N5試煉塔</h3>
              <p class="area-subtitle">Day 54-60</p>
              <div class="area-progress">
                <div class="stars-display">
                  {{ getAreaStars(6) }}/6 ⭐
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (getAreaStars(6) / 6 * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部導航 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-20">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-around">
          <button @click="openDailyTasks" class="nav-item">
            <div class="text-2xl mb-1">📋</div>
            <span class="text-xs">每日任務</span>
            <div v-if="gameStore.dailyTasksCompleted < gameStore.dailyTasks.length" 
                 class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
          
          <button @click="openProfile" class="nav-item">
            <div class="text-2xl mb-1">👤</div>
            <span class="text-xs">角色</span>
          </button>
          
          <button @click="openShop" class="nav-item">
            <div class="text-2xl mb-1">🏪</div>
            <span class="text-xs">商店</span>
          </button>
          
          <button @click="openSettings" class="nav-item">
            <div class="text-2xl mb-1">⚙️</div>
            <span class="text-xs">設置</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'

// Stores and Router
const gameStore = useGameStore()
const authStore = useAuthStore()
const router = useRouter()

// 響應式數據
const currentArea = ref(1)

// 計算屬性
const isAreaUnlocked = computed(() => (areaId) => {
  return gameStore.getAreaUnlockStatus(areaId)
})

// 獲取區域星數
function getAreaStars(areaId) {
  const areaProgress = gameStore.mapProgress[areaId] || {}
  return Object.values(areaProgress).reduce((sum, stage) => sum + (stage.stars || 0), 0)
}

// 選擇區域
function selectArea(areaId) {
  if (!isAreaUnlocked.value(areaId)) {
    gameStore.setError('區域尚未解鎖，請完成前置關卡')
    return
  }
  
  currentArea.value = areaId
  router.push(`/game/area/${areaId}/stages`)
}

// 打開每日任務
function openDailyTasks() {
  router.push('/user/tasks')
}

// 打開角色頁面
function openProfile() {
  router.push('/user/profile')
}

// 打開商店
function openShop() {
  alert('🏪 商店功能即將上線，敬請期待！')
}

// 打開設置
function openSettings() {
  alert('⚙️ 設置功能即將上線，敬請期待！')
}

// 生命週期
onMounted(async () => {
  // 加載地圖進度
  await gameStore.loadMapProgress()
  
  // 加載每日任務
  await gameStore.loadDailyTasks()
})
</script>

<style scoped>
/* 浮動動畫 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float linear infinite;
}

/* 區域節點樣式 */
.area-node {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.area-node:not(.unlocked) {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
}

.area-node:not(.unlocked):hover {
  transform: none;
}

.area-node.unlocked:hover {
  transform: scale(1.05) translateY(-5px);
}

.area-node.current .area-card {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  border: 2px solid #3B82F6;
}

/* 區域卡片樣式 */
.area-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  padding: 1.5rem;
  text-align: center;
  min-width: 140px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.area-card.final-area {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-color: #FFD700;
}

.area-title {
  font-size: 1rem;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 0.25rem;
}

.area-subtitle {
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.75rem;
}

/* 進度條 */
.area-progress {
  margin-top: 0.75rem;
}

.stars-display {
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.progress-bar {
  height: 0.25rem;
  background-color: #E5E7EB;
  border-radius: 0.125rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);
  border-radius: 0.125rem;
  transition: width 0.5s ease;
}

/* 底部導航項目 */
.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  color: #6B7280;
}

.nav-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

/* 響應式 */
@media (max-width: 768px) {
  .areas-container {
    transform: scale(0.8);
    transform-origin: center;
  }
  
  .area-card {
    min-width: 120px;
    padding: 1rem;
  }
  
  .area-icon {
    font-size: 3rem !important;
  }
  
  .area-title {
    font-size: 0.875rem;
  }
  
  .area-subtitle {
    font-size: 0.625rem;
  }
}

@media (max-width: 480px) {
  .areas-container {
    transform: scale(0.7);
  }
  
  .area-card {
    min-width: 100px;
    padding: 0.75rem;
  }
}
</style>