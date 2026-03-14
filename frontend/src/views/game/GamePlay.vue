<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-green-200 flex items-center justify-center">
    <div class="max-w-2xl mx-auto px-4 text-center">
      <!-- 遊戲區域指示 -->
      <div class="bg-white rounded-xl shadow-xl p-8 mb-8">
        <div class="text-6xl mb-4">🎮</div>
        <h1 class="text-3xl font-bold text-gray-800 mb-4">遊戲區域</h1>
        <p class="text-xl text-gray-600 mb-6">
          正在進入 區域{{ areaId }} - 關卡{{ stageId }}
        </p>
        
        <!-- 遊戲信息 -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500">區域ID</p>
            <p class="text-lg font-bold text-gray-800">{{ areaId }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500">關卡ID</p>
            <p class="text-lg font-bold text-gray-800">{{ stageId }}</p>
          </div>
        </div>

        <!-- 開發提示 -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p class="text-yellow-800">
            🚧 此遊戲模式正在開發中...
          </p>
        </div>

        <!-- 操作按鈕 -->
        <div class="space-y-4">
          <button
            @click="startDemo"
            class="w-full game-button"
          >
            🎯 開始演示遊戲
          </button>
          
          <div class="flex space-x-4">
            <button
              @click="$router.push(`/game/area/${areaId}/stages`)"
              class="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← 返回關卡選擇
            </button>
            <button
              @click="$router.push('/game/map')"
              class="flex-1 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              🗺️ 返回地圖
            </button>
          </div>
        </div>
      </div>

      <!-- 即將推出的遊戲類型 -->
      <div class="bg-white/80 rounded-xl p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">即將推出的遊戲模式</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div class="p-4 bg-white rounded-lg">
            <div class="text-2xl mb-2">🔀</div>
            <p class="text-sm font-medium">假名消消樂</p>
          </div>
          <div class="p-4 bg-white rounded-lg">
            <div class="text-2xl mb-2">👹</div>
            <p class="text-sm font-medium">BOSS戰</p>
          </div>
          <div class="p-4 bg-white rounded-lg">
            <div class="text-2xl mb-2">🎤</div>
            <p class="text-sm font-medium">語音道場</p>
          </div>
          <div class="p-4 bg-white rounded-lg">
            <div class="text-2xl mb-2">🏃</div>
            <p class="text-sm font-medium">語法跑酷</p>
          </div>
          <div class="p-4 bg-white rounded-lg">
            <div class="text-2xl mb-2">🎯</div>
            <p class="text-sm font-medium">聽力射擊</p>
          </div>
          <div class="p-4 bg-white rounded-lg">
            <div class="text-2xl mb-2">📝</div>
            <p class="text-sm font-medium">模擬考試</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 獲取路由參數
const props = defineProps({
  areaId: {
    type: [String, Number],
    required: true
  },
  stageId: {
    type: [String, Number],
    required: true
  }
})

// 演示遊戲
const startDemo = () => {
  alert(`即將開始 區域${props.areaId} 關卡${props.stageId} 的遊戲！\n\n這裡將來會是實際的遊戲界面。`)
  
  // 模擬遊戲完成，返回關卡選擇
  setTimeout(() => {
    router.push(`/game/area/${props.areaId}/stages`)
  }, 2000)
}
</script>