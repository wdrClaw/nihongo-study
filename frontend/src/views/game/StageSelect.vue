<template>
  <!-- 移动端关卡选择页 -->
  <div class="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary relative overflow-hidden">
    
    <!-- 樱花飘落装饰 -->
    <div class="bg-sakura absolute inset-0 pointer-events-none z-0"></div>
    
    <!-- 顶部：返回按钮 + 区域名 + 进度条 -->
    <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div class="px-5 py-4">
        <!-- 顶部导航栏 -->
        <div class="flex items-center justify-between mb-4">
          <!-- 返回按钮 -->
          <button @click="goBack" 
                  class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-text-primary font-medium shadow-sm transition-all duration-300 hover:bg-gray-50 touch-target">
            <span class="text-lg">←</span>
            <span>返回</span>
          </button>

          <!-- 区域标题 -->
          <div class="text-center flex-1">
            <h1 class="text-xl font-bold text-text-primary">{{ getAreaName() }}</h1>
          </div>
          
          <!-- 金币显示 -->
          <div class="flex items-center space-x-1 bg-accent-50 border border-accent-200 rounded-xl px-3 py-2">
            <span class="text-lg">💰</span>
            <span class="text-sm font-bold text-accent-600">
              {{ authStore.userCoins?.toLocaleString() || 0 }}
            </span>
          </div>
        </div>
        
        <!-- 进度条 -->
        <div class="w-full">
          <div class="flex items-center justify-between text-xs text-text-secondary mb-2">
            <span class="font-medium">{{ getAreaDescription() }}</span>
            <span class="font-bold">{{ areaProgress.completed }}/{{ areaProgress.total }}</span>
          </div>
          <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full transition-all duration-700"
              :style="{ width: areaProgress.total > 0 ? (areaProgress.completed / areaProgress.total * 100) + '%' : '0%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-text-secondary">加载关卡中...</p>
      </div>
    </div>

    <!-- 关卡列表：竖向卡片列表 -->
    <div v-else class="relative z-10 px-5 py-4 pb-24 space-y-4">
      
      <div 
        v-for="stage in stages" 
        :key="stage.stage_id"
        class="bg-white rounded-2xl p-4 shadow-lg transition-all duration-300 relative border-2"
        :class="{
          'border-success opacity-100': stage.stars > 0,
          'border-primary-200 opacity-100': stage.stars === 0 && stage.unlocked,
          'border-gray-200 opacity-60': !stage.unlocked
        }"
        @click="selectStage(stage)"
      >
        <!-- 每行一个关卡卡片，左图标+中间标题描述+右侧星级 -->
        <div class="flex items-center justify-between">
          
          <!-- 左侧：关卡图标 -->
          <div class="flex items-center space-x-4">
            <div class="text-4xl" :class="{ 'grayscale opacity-50': !stage.unlocked }">
              {{ getStageIcon(stage) }}
            </div>
            <div class="flex-1">
              <h3 class="text-base font-bold mb-1"
                  :class="stage.unlocked ? 'text-text-primary' : 'text-gray-400'">
                {{ stage.name_cn || `关卡 ${stage.stage_id}` }}
              </h3>
              <p class="text-sm mb-2"
                 :class="stage.unlocked ? 'text-text-secondary' : 'text-gray-400'">
                {{ stage.description_cn || getGameTypeName(stage.game_type) }}
              </p>
              <!-- 游戏类型标签 -->
              <span class="inline-block px-2 py-1 rounded-full text-xs font-medium"
                    :class="getGameTypeStyle(stage.game_type, stage.unlocked)">
                {{ getGameTypeName(stage.game_type) }}
              </span>
            </div>
          </div>
          
          <!-- 右侧：星级+状态 -->
          <div class="text-right flex flex-col items-center space-y-2">
            <!-- 星级显示 -->
            <div class="flex items-center space-x-1">
              <span v-for="i in 3" :key="i" 
                    :class="i <= stage.stars ? 'text-accent-500' : 'text-gray-300'"
                    class="text-lg">
                ⭐
              </span>
            </div>
            
            <!-- 状态图标 -->
            <div class="w-8 h-8 rounded-full flex items-center justify-center">
              <!-- 已完成：绿色边框+金星 -->
              <div v-if="stage.stars > 0" class="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span class="text-white text-sm">✓</span>
              </div>
              <!-- 可挑战：主色边框+箭头 -->
              <div v-else-if="stage.unlocked" class="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">→</span>
              </div>
              <!-- 锁定：灰色+锁头 -->
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-white text-sm">🔒</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 最佳成绩 -->
        <div v-if="stage.best_score > 0" class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center justify-between text-xs">
            <span class="text-text-secondary">最佳成绩</span>
            <span class="font-bold text-accent-600">{{ stage.best_score }}分</span>
          </div>
        </div>
        
        <!-- 解锁提示 -->
        <div v-if="!stage.unlocked" class="mt-3 pt-3 border-t border-gray-100">
          <div class="text-xs text-error text-center">
            {{ getUnlockHint(stage) }}
          </div>
        </div>
      </div>

      <!-- 暂无关卡提示 -->
      <div v-if="stages.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">🏗️</div>
        <h3 class="text-xl font-bold text-text-primary mb-2">关卡建设中</h3>
        <p class="text-text-secondary">这个区域的关卡正在开发中，敬请期待！</p>
      </div>
    </div>

    <!-- 底部安全区 -->
    <div class="h-8"></div>
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

// 响应式数据
const loading = ref(true)
const stages = ref([])

// 计算属性
const areaProgress = computed(() => {
  let completed = 0
  let stars = 0
  
  stages.value.forEach(stage => {
    if (stage.stars > 0) completed++
    stars += stage.stars
  })
  
  return {
    completed,
    total: stages.value.length,
    stars
  }
})

// 区域映射
const areaMap = {
  1: { name: '五十音岛', description: '学习假名的起点' },
  2: { name: '单词村', description: '收集词汇的宝库' },
  3: { name: '语法城', description: '掌握语法的要塞' },
  4: { name: '会话广场', description: '练习对话的舞台' },
  5: { name: '读解森林', description: '提升理解的森林' },
  6: { name: 'N5试炼塔', description: '最终挑战的高塔' }
}

const gameTypeMap = {
  'match_clear': '假名消消乐',
  'word_battle': '单词BOSS战', 
  'voice_dojo': '语音道场',
  'grammar_runner': '语法跑酷',
  'listening_shooter': '听力射击'
}

// 获取区域名称
function getAreaName() {
  return areaMap[props.areaId]?.name || `区域 ${props.areaId}`
}

// 获取区域描述
function getAreaDescription() {
  return areaMap[props.areaId]?.description || '探索未知的领域'
}

// 获取关卡图标
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
    'match_clear': baseStyle + 'bg-primary-50 text-primary-600 border border-primary-200',
    'word_battle': baseStyle + 'bg-error/10 text-error border border-error/20',
    'voice_dojo': baseStyle + 'bg-secondary-50 text-secondary-600 border border-secondary-200',
    'grammar_runner': baseStyle + 'bg-success/10 text-success border border-success/20',
    'listening_shooter': baseStyle + 'bg-accent-50 text-accent-600 border border-accent-200'
  }
  return styleMap[gameType] || (baseStyle + 'bg-gray-100 text-text-secondary border border-gray-200')
}

// 获取解锁提示
function getUnlockHint(stage) {
  if (stage.stage_id === 1) {
    return '需要完成前一区域'
  } else {
    return '需要完成前一关'
  }
}

// 选择关卡
function selectStage(stage) {
  if (!stage.unlocked) {
    alert('关卡尚未解锁')
    return
  }
  
  // 跳转到游戏页面
  router.push(`/game/area/${props.areaId}/stage/${stage.stage_id}`)
}

// 返回世界地图
function goBack() {
  router.push('/game/map')
}

// 加载关卡列表（模拟数据，实际应该从API获取）
async function loadStages() {
  try {
    loading.value = true
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟关卡数据
    const mockStages = [
      {
        stage_id: 1,
        name_cn: '基础发音练习',
        description_cn: '学习あいうえお的正确发音',
        game_type: 'match_clear',
        unlocked: true,
        stars: 3,
        best_score: 950
      },
      {
        stage_id: 2,
        name_cn: '假名配对',
        description_cn: '平假名和片假名的配对练习',
        game_type: 'word_battle',
        unlocked: true,
        stars: 2,
        best_score: 780
      },
      {
        stage_id: 3,
        name_cn: '发音挑战',
        description_cn: '准确发音获得高分',
        game_type: 'voice_dojo',
        unlocked: true,
        stars: 0,
        best_score: 0
      },
      {
        stage_id: 4,
        name_cn: '速度测试',
        description_cn: '在限定时间内完成假名识别',
        game_type: 'grammar_runner',
        unlocked: false,
        stars: 0,
        best_score: 0
      }
    ]
    
    stages.value = mockStages
    
  } catch (error) {
    console.error('加载关卡失败:', error)
    stages.value = []
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  console.log('🎯 关卡选择页已加载 - 移动端竖向列表布局')
  loadStages()
})
</script>