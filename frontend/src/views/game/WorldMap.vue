<template>
  <!-- 移动端地图页 - 竖向列表布局 -->
  <div class="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary relative overflow-hidden">
    
    <!-- 樱花飘落装饰 -->
    <div class="bg-sakura absolute inset-0 pointer-events-none z-0"></div>
    
    <!-- 顶部固定：用户信息栏 -->
    <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-primary-100 shadow-sm">
      <div class="px-5 py-4">
        <!-- 用户信息卡 -->
        <div class="flex items-center justify-between mb-4">
          <!-- 左侧：头像+昵称+等级 -->
          <div class="flex items-center space-x-3">
            <div class="relative">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {{ authStore.userNickname?.charAt(0) || '冒' }}
              </div>
              <!-- 等级徽章 -->
              <div class="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md">
                {{ authStore.userLevel }}
              </div>
            </div>
            <div>
              <p class="font-bold text-text-primary">{{ authStore.userNickname || '冒险者' }}</p>
              <p class="text-sm text-text-secondary">{{ authStore.levelTitle || '初心者' }}</p>
            </div>
          </div>
          
          <!-- 右侧：金币 -->
          <div class="flex items-center space-x-2 bg-accent-50 border border-accent-200 rounded-xl px-3 py-2">
            <span class="text-xl">💰</span>
            <span class="text-lg font-bold text-accent-600">
              {{ authStore.userCoins?.toLocaleString() || 0 }}
            </span>
          </div>
        </div>
        
        <!-- 经验值条 -->
        <div class="w-full">
          <div class="flex items-center justify-between text-xs text-text-secondary mb-2">
            <span class="font-medium">经验值</span>
            <span class="font-bold">{{ authStore.levelProgress?.toFixed(0) || 0 }}%</span>
          </div>
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full transition-all duration-700"
              :style="{ width: (authStore.levelProgress || 0) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="relative z-10 pb-24">
      
      <!-- 统计卡：横向一排4个小卡片 -->
      <div class="px-5 py-4">
        <div class="grid grid-cols-4 gap-3">
          <!-- 总星星数 -->
          <div class="bg-white rounded-xl p-3 text-center shadow-sm border border-primary-100">
            <div class="text-2xl font-bold text-primary-400 mb-1">
              {{ gameStore.totalStars || 0 }}
            </div>
            <div class="text-xs text-text-secondary">星星</div>
          </div>
          
          <!-- 完成关卡 -->
          <div class="bg-white rounded-xl p-3 text-center shadow-sm border border-success/20">
            <div class="text-2xl font-bold text-success mb-1">
              {{ gameStore.completedStages || 0 }}
            </div>
            <div class="text-xs text-text-secondary">关卡</div>
          </div>
          
          <!-- 掌握单词 -->
          <div class="bg-white rounded-xl p-3 text-center shadow-sm border border-accent-200">
            <div class="text-2xl font-bold text-accent-500 mb-1">
              {{ gameStore.masteredWords || 0 }}
            </div>
            <div class="text-xs text-text-secondary">单词</div>
          </div>
          
          <!-- 连续学习 -->
          <div class="bg-white rounded-xl p-3 text-center shadow-sm border border-secondary-100">
            <div class="text-2xl font-bold text-secondary-500 mb-1">
              {{ authStore.user?.consecutive_days || 0 }}
            </div>
            <div class="text-xs text-text-secondary">天数</div>
          </div>
        </div>
      </div>

      <!-- 区域列表：垂直滚动的6个区域卡片 -->
      <div class="px-5 space-y-4">
        
        <!-- 五十音岛 -->
        <div 
          class="bg-white rounded-2xl p-4 shadow-lg border border-primary-100 transition-all duration-300"
          :class="{ 
            'opacity-100': isAreaUnlocked(1), 
            'opacity-60': !isAreaUnlocked(1)
          }"
          @click="selectArea(1)"
        >
          <div class="flex items-center justify-between">
            <!-- 左侧：区域图标 -->
            <div class="flex items-center space-x-4">
              <div class="text-5xl">🏝️</div>
              <div>
                <h3 class="text-lg font-bold text-text-primary">五十音岛</h3>
                <p class="text-sm text-text-secondary">Day 1-7 • 基础发音</p>
                <!-- 星星进度条 -->
                <div class="flex items-center space-x-2 mt-2">
                  <div class="flex items-center space-x-1">
                    <span class="text-accent-500">⭐</span>
                    <span class="text-sm font-bold text-text-primary">{{ getAreaStars(1) }}/21</span>
                  </div>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-700"
                      :style="{ width: (getAreaStars(1) / 21 * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 右侧：解锁状态 -->
            <div class="text-right">
              <div v-if="isAreaUnlocked(1)" class="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span class="text-white text-sm">✓</span>
              </div>
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">🔒</span>
              </div>
            </div>
          </div>
          <!-- 左侧彩色条 -->
          <div v-if="isAreaUnlocked(1)" class="absolute left-0 top-0 bottom-0 w-1 bg-primary-400 rounded-l-2xl"></div>
        </div>

        <!-- 单词村 -->
        <div 
          class="bg-white rounded-2xl p-4 shadow-lg border border-secondary-100 transition-all duration-300 relative"
          :class="{ 
            'opacity-100': isAreaUnlocked(2), 
            'opacity-60': !isAreaUnlocked(2)
          }"
          @click="selectArea(2)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-5xl">🏘️</div>
              <div>
                <h3 class="text-lg font-bold text-text-primary">词汇岛</h3>
                <p class="text-sm text-text-secondary">Day 8-21 • 1000日常词汇</p>
                <div class="flex items-center space-x-2 mt-2">
                  <div class="flex items-center space-x-1">
                    <span class="text-accent-500">★</span>
                    <span class="text-sm font-bold text-text-primary">{{ getAreaStars(2) }}/60</span>
                  </div>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-700"
                      :style="{ width: (getAreaStars(2) / 60 * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div v-if="isAreaUnlocked(2)" class="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span class="text-white text-sm">✓</span>
              </div>
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">🔒</span>
              </div>
            </div>
          </div>
          <div v-if="isAreaUnlocked(2)" class="absolute left-0 top-0 bottom-0 w-1 bg-secondary-400 rounded-l-2xl"></div>
        </div>

        <!-- 语法城 -->
        <div 
          class="bg-white rounded-2xl p-4 shadow-lg border border-accent-100 transition-all duration-300 relative"
          :class="{ 
            'opacity-100': isAreaUnlocked(3), 
            'opacity-60': !isAreaUnlocked(3)
          }"
          @click="selectArea(3)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-5xl">🏯</div>
              <div>
                <h3 class="text-lg font-bold text-text-primary">语法城</h3>
                <p class="text-sm text-text-secondary">Day 22-35 • 语法规则</p>
                <div class="flex items-center space-x-2 mt-2">
                  <div class="flex items-center space-x-1">
                    <span class="text-accent-500">⭐</span>
                    <span class="text-sm font-bold text-text-primary">{{ getAreaStars(3) }}/18</span>
                  </div>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-700"
                      :style="{ width: (getAreaStars(3) / 18 * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div v-if="isAreaUnlocked(3)" class="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span class="text-white text-sm">✓</span>
              </div>
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">🔒</span>
              </div>
            </div>
          </div>
          <div v-if="isAreaUnlocked(3)" class="absolute left-0 top-0 bottom-0 w-1 bg-accent-400 rounded-l-2xl"></div>
        </div>

        <!-- 会话广场 -->
        <div 
          class="bg-white rounded-2xl p-4 shadow-lg border border-success/20 transition-all duration-300 relative"
          :class="{ 
            'opacity-100': isAreaUnlocked(4), 
            'opacity-60': !isAreaUnlocked(4)
          }"
          @click="selectArea(4)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-5xl">🎪</div>
              <div>
                <h3 class="text-lg font-bold text-text-primary">会话广场</h3>
                <p class="text-sm text-text-secondary">Day 36-45 • 口语练习</p>
                <div class="flex items-center space-x-2 mt-2">
                  <div class="flex items-center space-x-1">
                    <span class="text-accent-500">⭐</span>
                    <span class="text-sm font-bold text-text-primary">{{ getAreaStars(4) }}/12</span>
                  </div>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-success to-green-500 rounded-full transition-all duration-700"
                      :style="{ width: (getAreaStars(4) / 12 * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div v-if="isAreaUnlocked(4)" class="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span class="text-white text-sm">✓</span>
              </div>
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">🔒</span>
              </div>
            </div>
          </div>
          <div v-if="isAreaUnlocked(4)" class="absolute left-0 top-0 bottom-0 w-1 bg-success rounded-l-2xl"></div>
        </div>

        <!-- 读解森林 -->
        <div 
          class="bg-white rounded-2xl p-4 shadow-lg border border-green-100 transition-all duration-300 relative"
          :class="{ 
            'opacity-100': isAreaUnlocked(5), 
            'opacity-60': !isAreaUnlocked(5)
          }"
          @click="selectArea(5)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-5xl">🌲</div>
              <div>
                <h3 class="text-lg font-bold text-text-primary">读解森林</h3>
                <p class="text-sm text-text-secondary">Day 46-53 • 阅读理解</p>
                <div class="flex items-center space-x-2 mt-2">
                  <div class="flex items-center space-x-1">
                    <span class="text-accent-500">⭐</span>
                    <span class="text-sm font-bold text-text-primary">{{ getAreaStars(5) }}/9</span>
                  </div>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-700"
                      :style="{ width: (getAreaStars(5) / 9 * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div v-if="isAreaUnlocked(5)" class="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span class="text-white text-sm">✓</span>
              </div>
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">🔒</span>
              </div>
            </div>
          </div>
          <div v-if="isAreaUnlocked(5)" class="absolute left-0 top-0 bottom-0 w-1 bg-green-400 rounded-l-2xl"></div>
        </div>

        <!-- N5试炼塔 -->
        <div 
          class="bg-white rounded-2xl p-4 shadow-lg border-2 border-accent-300 transition-all duration-300 relative"
          :class="{ 
            'opacity-100': isAreaUnlocked(6), 
            'opacity-60': !isAreaUnlocked(6)
          }"
          @click="selectArea(6)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-5xl">🏆</div>
              <div>
                <h3 class="text-lg font-bold text-accent-600">N5试炼塔</h3>
                <p class="text-sm text-text-secondary">Day 54-60 • 综合测试</p>
                <div class="flex items-center space-x-2 mt-2">
                  <div class="flex items-center space-x-1">
                    <span class="text-accent-500">⭐</span>
                    <span class="text-sm font-bold text-accent-600">{{ getAreaStars(6) }}/6</span>
                  </div>
                  <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-700"
                      :style="{ width: (getAreaStars(6) / 6 * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div v-if="isAreaUnlocked(6)" class="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">👑</span>
              </div>
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">🔒</span>
              </div>
            </div>
          </div>
          <div v-if="isAreaUnlocked(6)" class="absolute left-0 top-0 bottom-0 w-1 bg-accent-400 rounded-l-2xl"></div>
        </div>

      </div>
    </div>

    <!-- 底部导航栏：固定底部 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-30">
      <div class="px-5 py-3">
        <div class="grid grid-cols-4 gap-1">
          <!-- 每日任务 -->
          <button @click="openDailyTasks" class="flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 hover:bg-primary-50 relative">
            <div class="text-2xl mb-1">📋</div>
            <span class="text-xs font-medium text-text-secondary">每日任务</span>
            <div v-if="gameStore.dailyTasksCompleted < gameStore.dailyTasks?.length" 
                 class="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></div>
          </button>
          
          <!-- 角色 -->
          <button @click="openProfile" class="flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 hover:bg-primary-50">
            <div class="text-2xl mb-1">👤</div>
            <span class="text-xs font-medium text-text-secondary">角色</span>
          </button>
          
          <!-- 商店 -->
          <button @click="openShop" class="flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 hover:bg-primary-50">
            <div class="text-2xl mb-1">🏪</div>
            <span class="text-xs font-medium text-text-secondary">商店</span>
          </button>
          
          <!-- 设置 -->
          <button @click="openSettings" class="flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-300 hover:bg-primary-50">
            <div class="text-2xl mb-1">⚙️</div>
            <span class="text-xs font-medium text-text-secondary">设置</span>
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

// 响应式数据
const currentArea = ref(1)

// 计算属性
const isAreaUnlocked = computed(() => (areaId) => {
  // 第一个区域总是解锁的
  if (areaId === 1) return true
  
  // 其他区域需要前一个区域有进度才解锁
  return gameStore.getAreaUnlockStatus ? gameStore.getAreaUnlockStatus(areaId) : false
})

// 获取区域星数
function getAreaStars(areaId) {
  if (!gameStore.mapProgress) return 0
  
  const areaProgress = gameStore.mapProgress[areaId] || {}
  return Object.values(areaProgress).reduce((sum, stage) => sum + (stage.stars || 0), 0)
}

// 选择区域
function selectArea(areaId) {
  if (!isAreaUnlocked.value(areaId)) {
    // 显示提示信息
    alert('区域尚未解锁，请完成前置关卡')
    return
  }
  
  currentArea.value = areaId
  router.push(`/game/area/${areaId}/stages`)
}

// 打开每日任务
function openDailyTasks() {
  router.push('/user/tasks')
}

// 打开角色页面
function openProfile() {
  router.push('/user/profile')
}

// 打开商店
function openShop() {
  alert('🏪 商店功能即将上线，敬请期待！')
}

// 打开设置
function openSettings() {
  alert('⚙️ 设置功能即将上线，敬请期待！')
}

// 生命周期
onMounted(async () => {
  console.log('🗺️ 地图页已加载 - 移动端竖向列表布局')
  
  try {
    // 加载地图进度
    if (gameStore.loadMapProgress) {
      await gameStore.loadMapProgress()
    }
    
    // 加载每日任务
    if (gameStore.loadDailyTasks) {
      await gameStore.loadDailyTasks()
    }
  } catch (error) {
    console.error('加载游戏数据失败:', error)
  }
})
</script>