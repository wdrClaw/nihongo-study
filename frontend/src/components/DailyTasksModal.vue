<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 遮罩層 -->
    <div 
      class="fixed inset-0 bg-black/50 transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- 彈窗內容 -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
        <!-- 關閉按鈕 -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>

        <!-- 頭部 -->
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center space-x-3">
            <div class="text-3xl">📋</div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">每日任務</h2>
              <p class="text-sm text-gray-500">完成任務獲得豐厚獎勵</p>
            </div>
          </div>
        </div>

        <!-- 任務列表 -->
        <div class="px-6 pb-6">
          <div class="space-y-3">
            <div
              v-for="task in gameStore.dailyTasks"
              :key="task.type"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              :class="{ 
                'bg-green-50 border border-green-200': task.completed,
                'bg-gray-50': !task.completed
              }"
            >
              <div class="flex items-center space-x-3">
                <div class="text-xl">
                  {{ getTaskIcon(task.type) }}
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ getTaskTitle(task.type) }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ getTaskDescription(task.type) }}
                  </p>
                </div>
              </div>

              <div class="text-right">
                <div v-if="task.completed" class="flex items-center space-x-1 text-green-600">
                  <CheckCircleIcon class="w-5 h-5" />
                  <span class="text-sm font-medium">已完成</span>
                </div>
                <div v-else class="text-sm text-gray-500">
                  <p>{{ getTaskReward(task.type) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 全部完成獎勵 -->
          <div 
            v-if="gameStore.dailyTasks.length > 0"
            class="mt-4 p-3 bg-gradient-to-r from-accent-50 to-primary-50 rounded-lg border border-accent-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="text-xl">🎁</div>
                <div>
                  <p class="font-medium text-gray-900">全部完成獎勵</p>
                  <p class="text-sm text-gray-500">+100 EXP + 50金幣</p>
                </div>
              </div>
              <div v-if="gameStore.allDailyTasksCompleted" class="text-green-600">
                <CheckCircleIcon class="w-6 h-6" />
              </div>
              <div v-else class="text-sm text-gray-500">
                {{ gameStore.dailyTasksCompleted }}/{{ gameStore.dailyTasks.length }}
              </div>
            </div>
          </div>

          <!-- 進度條 -->
          <div v-if="gameStore.dailyTasks.length > 0" class="mt-4">
            <div class="flex justify-between text-sm text-gray-500 mb-2">
              <span>今日進度</span>
              <span>{{ gameStore.dailyTasksCompleted }}/{{ gameStore.dailyTasks.length }}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (gameStore.dailyTasksCompleted / gameStore.dailyTasks.length) * 100 + '%' }"
              ></div>
            </div>
          </div>

          <!-- 空狀態 -->
          <div v-if="gameStore.dailyTasks.length === 0" class="text-center py-8">
            <div class="text-4xl mb-2">🎯</div>
            <p class="text-gray-500">今日任務正在準備中...</p>
          </div>
        </div>

        <!-- 底部 -->
        <div class="px-6 py-4 bg-gray-50 rounded-b-xl">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              任務每日 00:00 重置
            </div>
            <button
              @click="$emit('close')"
              class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/game'
import { XMarkIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const gameStore = useGameStore()

defineEmits(['close'])

// 獲取任務圖標
const getTaskIcon = (type) => {
  const icons = {
    new_words: '📝',
    stage: '🎮',
    voice: '🎤',
    review: '🔄'
  }
  return icons[type] || '📋'
}

// 獲取任務標題
const getTaskTitle = (type) => {
  const titles = {
    new_words: '學習新單詞',
    stage: '完成關卡',
    voice: '語音練習',
    review: '復習錯題'
  }
  return titles[type] || '未知任務'
}

// 獲取任務描述
const getTaskDescription = (type) => {
  const descriptions = {
    new_words: '學習3個新單詞',
    stage: '完成1個關卡',
    voice: '語音練習5分鐘',
    review: '復習昨天的錯題'
  }
  return descriptions[type] || '完成指定任務'
}

// 獲取任務獎勵
const getTaskReward = (type) => {
  const rewards = {
    new_words: '+20 EXP + 10金幣',
    stage: '+30 EXP + 15金幣',
    voice: '+20 EXP + 10金幣',
    review: '+30 EXP + 15金幣'
  }
  return rewards[type] || '獎勵'
}
</script>