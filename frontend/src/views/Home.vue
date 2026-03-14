<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-100 via-white to-secondary-100">
    <div class="max-w-4xl mx-auto px-4 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-xl mb-8">
          <span class="text-6xl">🎌</span>
        </div>
        <h1 class="text-5xl font-bold text-gray-800 mb-4">
          Nihongo Quest
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          60天通關 JLPT N5 的遊戲化日語學習平台
        </p>
        <div class="flex justify-center space-x-4">
          <router-link
            to="/auth/register"
            class="game-button text-lg px-8 py-4"
          >
            🚀 開始冒險
          </router-link>
          <router-link
            to="/auth/login"
            class="px-8 py-4 text-lg border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-300"
          >
            登入遊戲
          </router-link>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="text-center">
          <div class="text-4xl mb-4">🎮</div>
          <h3 class="text-xl font-bold mb-2">6種遊戲模式</h3>
          <p class="text-gray-600">消消樂、BOSS戰、語音道場、語法跑酷、聽力射擊、模擬考試</p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-4">🗺️</div>
          <h3 class="text-xl font-bold mb-2">6大冒險區域</h3>
          <p class="text-gray-600">從五十音島到N5試煉塔，循序漸進掌握日語</p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-4">📚</div>
          <h3 class="text-xl font-bold mb-2">完整學習體系</h3>
          <p class="text-gray-600">800個單詞、82個語法點、92個假名，全面覆蓋N5內容</p>
        </div>
      </div>

      <!-- Learning Path -->
      <div class="bg-white rounded-xl shadow-lg p-8 mb-16">
        <h2 class="text-2xl font-bold text-center mb-8">學習路徑</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(area, index) in areas" 
            :key="area.id"
            class="flex items-center space-x-4 p-4 rounded-lg bg-gray-50"
          >
            <div class="text-3xl">{{ area.icon }}</div>
            <div>
              <h4 class="font-bold">{{ area.name }}</h4>
              <p class="text-sm text-gray-600">{{ area.days }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <h2 class="text-3xl font-bold mb-4">準備好開始日語冒險了嗎？</h2>
        <p class="text-xl text-gray-600 mb-8">
          加入 Nihongo Quest，讓學習日語變得有趣且有效！
        </p>
        <router-link
          to="/auth/register"
          class="game-button text-xl px-12 py-6"
        >
          🎌 立即開始
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 區域數據
const areas = [
  {
    id: 1,
    name: '五十音島',
    icon: '🏝️',
    days: 'Day 1-7'
  },
  {
    id: 2,
    name: '單詞村',
    icon: '🏘️',
    days: 'Day 8-21'
  },
  {
    id: 3,
    name: '語法城',
    icon: '🏯',
    days: 'Day 22-35'
  },
  {
    id: 4,
    name: '會話廣場',
    icon: '🎪',
    days: 'Day 36-45'
  },
  {
    id: 5,
    name: '讀解森林',
    icon: '📖',
    days: 'Day 46-53'
  },
  {
    id: 6,
    name: 'N5試煉塔',
    icon: '🏆',
    days: 'Day 54-60'
  }
]
</script>