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
          <h1 class="text-xl font-bold text-gray-800">每日任務</h1>
        </div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- 進度概覽 -->
      <div class="game-card p-6 mb-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">今日任務進度</h2>
          <div class="flex justify-center items-center space-x-8">
            <div class="text-center">
              <div class="text-3xl font-bold text-primary-600">{{ completedTasks }}</div>
              <div class="text-sm text-gray-500">已完成</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-400">{{ totalTasks }}</div>
              <div class="text-sm text-gray-500">總任務</div>
            </div>
          </div>
          
          <!-- 進度條 -->
          <div class="mt-4">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <p class="text-sm text-gray-500 mt-2">{{ progressPercentage }}% 完成</p>
          </div>
        </div>
      </div>

      <!-- 任務列表 -->
      <div class="space-y-4 mb-6">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="game-card p-6"
          :class="{ 'bg-green-50 border-green-200': task.completed }"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="text-3xl">{{ task.icon }}</div>
              <div>
                <h3 class="text-lg font-bold text-gray-800">{{ task.title }}</h3>
                <p class="text-gray-600">{{ task.description }}</p>
                <p class="text-sm text-gray-500 mt-1">獎勵：{{ task.reward }}</p>
              </div>
            </div>

            <div class="text-right">
              <div v-if="task.completed" class="flex items-center text-green-600">
                <CheckCircleIcon class="w-6 h-6 mr-2" />
                <span class="font-medium">已完成</span>
              </div>
              <div v-else class="space-y-2">
                <div class="text-sm text-gray-500">
                  進度：{{ task.progress }}/{{ task.target }}
                </div>
                <button
                  v-if="task.progress >= task.target && !task.completed"
                  @click="completeTask(task)"
                  class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  領取獎勵
                </button>
                <button
                  v-else-if="!task.completed"
                  @click="goToTask(task)"
                  class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  去完成
                </button>
              </div>
            </div>
          </div>

          <!-- 進度條 -->
          <div v-if="!task.completed" class="mt-4">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: Math.min(task.progress / task.target * 100, 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全部完成獎勵 -->
      <div 
        v-if="tasks.length > 0"
        class="game-card p-6"
        :class="{ 
          'bg-gradient-to-r from-accent-50 to-primary-50 border-accent-200': allTasksCompleted,
          'bg-gray-50': !allTasksCompleted
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="text-3xl">🎁</div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">完美一天</h3>
              <p class="text-gray-600">完成所有每日任務</p>
              <p class="text-sm text-gray-500 mt-1">獎勵：+100 EXP + 50金幣</p>
            </div>
          </div>

          <div class="text-right">
            <div v-if="allTasksCompleted" class="flex items-center text-green-600">
              <CheckCircleIcon class="w-6 h-6 mr-2" />
              <span class="font-medium">已領取</span>
            </div>
            <div v-else class="text-sm text-gray-500">
              {{ completedTasks }}/{{ totalTasks }}
            </div>
          </div>
        </div>
      </div>

      <!-- 歷史記錄 -->
      <div class="mt-8">
        <h3 class="text-lg font-bold text-gray-800 mb-4">連續完成記錄</h3>
        <div class="game-card p-6">
          <div class="grid grid-cols-7 gap-2 mb-4">
            <div
              v-for="day in recentDays"
              :key="day.date"
              class="aspect-square rounded-lg flex items-center justify-center text-sm"
              :class="{
                'bg-green-500 text-white': day.completed,
                'bg-gray-200 text-gray-500': !day.completed && day.isPast,
                'bg-blue-100 text-blue-600': day.isToday,
                'bg-gray-100 text-gray-400': !day.completed && !day.isPast && !day.isToday
              }"
            >
              <div class="text-center">
                <div class="text-xs">{{ day.dayName }}</div>
                <div>{{ day.date }}</div>
              </div>
            </div>
          </div>
          <p class="text-center text-gray-600">
            連續完成：<span class="font-bold text-primary-600">{{ consecutiveDays }}</span> 天
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const gameStore = useGameStore()

// 模擬任務數據
const tasks = ref([
  {
    id: 1,
    type: 'new_words',
    title: '學習新單詞',
    description: '學習3個新單詞',
    icon: '📝',
    reward: '+20 EXP + 10金幣',
    progress: 1,
    target: 3,
    completed: false
  },
  {
    id: 2,
    type: 'stage',
    title: '完成關卡',
    description: '完成1個關卡',
    icon: '🎮',
    reward: '+30 EXP + 15金幣',
    progress: 0,
    target: 1,
    completed: false
  },
  {
    id: 3,
    type: 'voice',
    title: '語音練習',
    description: '語音練習5分鐘',
    icon: '🎤',
    reward: '+20 EXP + 10金幣',
    progress: 2,
    target: 5,
    completed: false
  },
  {
    id: 4,
    type: 'review',
    title: '復習錯題',
    description: '復習昨天的錯題',
    icon: '🔄',
    reward: '+30 EXP + 15金幣',
    progress: 0,
    target: 1,
    completed: false
  }
])

// 模擬連續天數
const consecutiveDays = ref(5)

// 計算屬性
const completedTasks = computed(() => {
  return tasks.value.filter(task => task.completed).length
})

const totalTasks = computed(() => {
  return tasks.value.length
})

const progressPercentage = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
})

const allTasksCompleted = computed(() => {
  return tasks.value.length > 0 && tasks.value.every(task => task.completed)
})

// 生成最近7天的數據
const recentDays = computed(() => {
  const days = []
  const today = new Date()
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    days.push({
      date: date.getDate(),
      dayName: dayNames[date.getDay()],
      isToday: i === 0,
      isPast: i > 0,
      completed: i <= consecutiveDays.value && i > 0 // 模擬完成狀態
    })
  }
  
  return days
})

// 方法
const completeTask = async (task) => {
  task.completed = true
  // TODO: 調用API提交任務完成
  // const result = await gameStore.completeDailyTask(task.type)
}

const goToTask = (task) => {
  // 根據任務類型跳轉到相應頁面
  switch (task.type) {
    case 'new_words':
    case 'stage':
      router.push('/game/map')
      break
    case 'voice':
      // 跳轉到語音練習
      router.push('/game/map')
      break
    case 'review':
      // 跳轉到復習頁面
      router.push('/game/map')
      break
    default:
      router.push('/game/map')
  }
}
</script>