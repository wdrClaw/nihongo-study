<template>
  <div class="match-clear-game h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
    <!-- 背景裝飾 -->
    <div class="absolute inset-0">
      <div class="absolute top-10 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-30 animate-pulse"></div>
      <div class="absolute top-1/3 right-10 w-16 h-16 bg-blue-200 rounded-full opacity-40 animate-bounce"></div>
      <div class="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-200 rounded-full opacity-35 animate-pulse"></div>
    </div>

    <!-- 頂部信息欄 -->
    <div class="relative z-10 flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm">
      <!-- 返回按鈕 -->
      <button @click="goBack" class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
        <span>←</span>
        <span>返回</span>
      </button>

      <!-- 遊戲信息 -->
      <div class="flex items-center space-x-6">
        <!-- 時間 -->
        <div v-if="gameConfig.mode !== 'basic'" class="flex items-center space-x-2">
          <span>⏱️</span>
          <span class="text-xl font-bold" :class="{ 'text-red-500 animate-pulse': timeLeft <= 10 }">
            {{ Math.ceil(timeLeft) }}s
          </span>
        </div>

        <!-- 分數 -->
        <div class="flex items-center space-x-2">
          <span>🎯</span>
          <span class="text-xl font-bold text-blue-600">{{ score }}</span>
        </div>

        <!-- 翻牌次數 -->
        <div class="flex items-center space-x-2">
          <span>🔄</span>
          <span class="text-lg">{{ flipCount }}</span>
        </div>

        <!-- 星級預覽 -->
        <div class="flex items-center space-x-1">
          <span v-for="i in 3" :key="i" 
                :class="i <= currentStars ? 'text-yellow-500' : 'text-gray-300'"
                class="text-xl">
            ⭐
          </span>
        </div>
      </div>
    </div>

    <!-- 遊戲區域 -->
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="game-grid" :class="gridClass">
        <div
          v-for="(card, index) in cards"
          :key="index"
          :class="[
            'card',
            {
              'flipped': card.isFlipped,
              'matched': card.isMatched,
              'shake': card.isShaking
            }
          ]"
          @click="flipCard(index)"
        >
          <!-- 卡片正面 -->
          <div class="card-front">
            <span class="card-text">{{ card.isFlipped || card.isMatched ? card.content : '' }}</span>
          </div>
          
          <!-- 卡片背面 -->
          <div class="card-back">
            <span class="text-4xl">🎴</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 配對成功動畫 -->
    <div v-if="showMatchEffect" class="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div class="match-effect animate-ping">
        <span class="text-6xl">✨</span>
      </div>
    </div>

    <!-- 遊戲結束彈窗 -->
    <div v-if="gameEnded" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="mb-6">
          <div class="text-6xl mb-4">{{ gameResult === 'win' ? '🎉' : '😅' }}</div>
          <h2 class="text-2xl font-bold mb-2">
            {{ gameResult === 'win' ? '恭喜完成！' : '時間到！' }}
          </h2>
          <div class="flex justify-center items-center space-x-1 mb-4">
            <span v-for="i in 3" :key="i" 
                  :class="i <= finalStars ? 'text-yellow-500' : 'text-gray-300'"
                  class="text-3xl animate-bounce"
                  :style="{ animationDelay: `${i * 0.1}s` }">
              ⭐
            </span>
          </div>
          <div class="space-y-2 text-gray-600">
            <p>最終分數: <span class="font-bold text-blue-600">{{ score }}</span></p>
            <p>翻牌次數: <span class="font-bold">{{ flipCount }}</span></p>
            <p v-if="gameConfig.mode !== 'basic'">用時: <span class="font-bold">{{ Math.ceil(totalTime - timeLeft) }}秒</span></p>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button @click="restartGame" 
                  class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
            重新挑戰
          </button>
          <button @click="submitResult" :disabled="submitting"
                  class="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors">
            {{ submitting ? '提交中...' : '確認結果' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 音效播放器 -->
    <audio ref="flipAudio" preload="auto">
      <source src="/sounds/card-flip.mp3" type="audio/mpeg">
    </audio>
    <audio ref="matchAudio" preload="auto">
      <source src="/sounds/match-success.mp3" type="audio/mpeg">
    </audio>
    <audio ref="completeAudio" preload="auto">
      <source src="/sounds/level-complete.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'

// Props
const props = defineProps({
  stageConfig: {
    type: Object,
    required: true
  }
})

// Stores
const gameStore = useGameStore()
const authStore = useAuthStore()
const router = useRouter()

// 響應式數據
const gameConfig = ref(props.stageConfig.game_config)
// 修復: game_data 可能不存在，用 game_config 作為 fallback
const gameData = ref(props.stageConfig.game_data || props.stageConfig.game_config)
const cards = ref([])
const flippedCards = ref([])
const score = ref(0)
const flipCount = ref(0)
const timeLeft = ref(props.stageConfig.time_limit_seconds || 180)
const totalTime = ref(timeLeft.value)
const gameEnded = ref(false)
const gameResult = ref('')
const finalStars = ref(0)
const showMatchEffect = ref(false)
const submitting = ref(false)
const timer = ref(null)

// 計算屬性
const gridClass = computed(() => {
  const gridSize = gameConfig.value.grid_size
  if (gridSize === '4x4') return 'grid-4x4'
  if (gridSize === '5x4') return 'grid-5x4'
  if (gridSize === '6x4') return 'grid-6x4'
  if (gridSize === '8x4') return 'grid-8x4'
  return 'grid-4x4'
})

const currentStars = computed(() => {
  const totalCards = cards.value.length
  const targetFlips = {
    1: totalCards * 2.5,
    2: totalCards * 2.0,
    3: totalCards * 1.5
  }
  
  if (flipCount.value <= targetFlips[3]) return 3
  if (flipCount.value <= targetFlips[2]) return 2
  if (flipCount.value <= targetFlips[1]) return 1
  return 0
})

// 初始化遊戲
function initializeGame() {
  const pairs = gameData.value.pairs
  const allCards = []
  
  // 創建卡片對
  pairs.forEach((pair, index) => {
    // 根據模式創建不同類型的卡片
    if (gameConfig.value.mode === 'basic') {
      allCards.push(
        { id: index * 2, content: pair.hiragana, type: 'hiragana', pairId: index, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, content: pair.romaji, type: 'romaji', pairId: index, isFlipped: false, isMatched: false }
      )
    } else if (gameConfig.value.mode === 'advanced') {
      allCards.push(
        { id: index * 2, content: pair.hiragana, type: 'hiragana', pairId: index, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, content: pair.katakana, type: 'katakana', pairId: index, isFlipped: false, isMatched: false }
      )
    } else if (gameConfig.value.mode === 'extreme') {
      // 極限模式：隨機三種組合
      const types = ['hiragana', 'katakana', 'romaji']
      const randomTypes = types.sort(() => Math.random() - 0.5).slice(0, 2)
      
      allCards.push(
        { id: index * 2, content: pair[randomTypes[0]], type: randomTypes[0], pairId: index, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, content: pair[randomTypes[1]], type: randomTypes[1], pairId: index, isFlipped: false, isMatched: false }
      )
    }
  })
  
  // 打亂卡片順序
  cards.value = allCards.sort(() => Math.random() - 0.5)
  
  // 重置遊戲狀態
  flippedCards.value = []
  score.value = 0
  flipCount.value = 0
  gameEnded.value = false
  timeLeft.value = totalTime.value
  
  // 啟動計時器（非基礎模式）
  if (gameConfig.value.mode !== 'basic') {
    startTimer()
  }
}

// 翻牌邏輯
function flipCard(index) {
  const card = cards.value[index]
  
  // 檢查是否可以翻牌
  if (card.isFlipped || card.isMatched || flippedCards.value.length >= 2 || gameEnded.value) {
    return
  }
  
  // 翻牌
  card.isFlipped = true
  flippedCards.value.push(index)
  flipCount.value++
  
  // 播放翻牌音效
  playSound('flip')
  
  // 檢查是否翻了兩張牌
  if (flippedCards.value.length === 2) {
    setTimeout(() => {
      checkMatch()
    }, 500)
  }
}

// 檢查匹配
function checkMatch() {
  const [index1, index2] = flippedCards.value
  const card1 = cards.value[index1]
  const card2 = cards.value[index2]
  
  if (card1.pairId === card2.pairId) {
    // 匹配成功
    card1.isMatched = true
    card2.isMatched = true
    
    // 計分
    let baseScore = 100
    if (gameConfig.value.mode === 'advanced') baseScore = 120
    if (gameConfig.value.mode === 'extreme') baseScore = 150
    
    score.value += baseScore
    
    // 顯示匹配效果
    showMatchEffect.value = true
    setTimeout(() => {
      showMatchEffect.value = false
    }, 1000)
    
    // 播放匹配成功音效
    playSound('match')
    
    // 檢查是否全部完成
    if (cards.value.every(card => card.isMatched)) {
      endGame('win')
    }
  } else {
    // 匹配失敗 - 震動效果
    card1.isShaking = true
    card2.isShaking = true
    
    setTimeout(() => {
      card1.isFlipped = false
      card2.isFlipped = false
      card1.isShaking = false
      card2.isShaking = false
    }, 800)
  }
  
  flippedCards.value = []
}

// 計時器
function startTimer() {
  timer.value = setInterval(() => {
    timeLeft.value--
    
    if (timeLeft.value <= 0) {
      endGame('timeout')
    }
    
    // 極限模式：每10秒復活一對卡片
    if (gameConfig.value.mode === 'extreme' && timeLeft.value % 10 === 0 && timeLeft.value > 0) {
      reviveRandomPair()
    }
  }, 1000)
}

// 極限模式：隨機復活卡片對
function reviveRandomPair() {
  const matchedCards = cards.value.filter(card => card.isMatched)
  if (matchedCards.length >= 2) {
    // 隨機選一對已匹配的卡片
    const randomPairId = matchedCards[Math.floor(Math.random() * matchedCards.length)].pairId
    cards.value.forEach(card => {
      if (card.pairId === randomPairId) {
        card.isMatched = false
        card.isFlipped = false
      }
    })
  }
}

// 結束遊戲
function endGame(result) {
  gameResult.value = result
  gameEnded.value = true
  finalStars.value = result === 'win' ? currentStars.value : 0
  
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  if (result === 'win') {
    playSound('complete')
  }
}

// 播放音效
function playSound(type) {
  if (!gameStore.gameSettings?.soundEnabled) return
  
  try {
    const audioMap = {
      flip: 'flipAudio',
      match: 'matchAudio', 
      complete: 'completeAudio'
    }
    
    const audioRef = audioMap[type]
    if (audioRef && $refs[audioRef]) {
      const audio = $refs[audioRef]
      
      // 檢查音頻文件是否可用（避免空文件導致的 416 錯誤）
      if (audio.readyState === 0) {
        // 靜默降級：文件不可用時不播放，避免報錯
        console.log(`音效文件 ${type} 不可用，靜默跳過`)
        return
      }
      
      audio.currentTime = 0
      audio.play().catch(e => {
        // 靜默降級：播放失敗時不顯示錯誤，避免影響遊戲體驗
        console.log(`音效 ${type} 播放跳過:`, e.message)
      })
    }
  } catch (error) {
    console.log('音效播放跳過:', error.message)
  }
}

// 重新開始
function restartGame() {
  initializeGame()
}

// 提交結果
async function submitResult() {
  if (submitting.value) return
  
  submitting.value = true
  
  try {
    const result = await gameStore.submitStageResult(
      props.stageConfig.area_id,
      props.stageConfig.stage_id,
      {
        score: score.value,
        time_spent: totalTime.value - timeLeft.value,
        stars: finalStars.value,
        answers: {
          flip_count: flipCount.value,
          mode: gameConfig.value.mode
        }
      }
    )
    
    if (result.success) {
      // 顯示獎勵
      authStore.addExp(result.rewards.exp)
      authStore.addCoins(result.rewards.coins)
      
      // 返回關卡選擇頁
      router.push(`/game/area/${props.stageConfig.area_id}/stages`)
    }
  } catch (error) {
    console.error('提交結果失敗:', error)
    gameStore.setError('提交結果失敗，請重試')
  } finally {
    submitting.value = false
  }
}

// 返回
function goBack() {
  if (timer.value) {
    clearInterval(timer.value)
  }
  router.back()
}

// 生命週期
onMounted(() => {
  initializeGame()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
/* 網格佈局 */
.grid-4x4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 12px;
  max-width: 400px;
  aspect-ratio: 1;
}

.grid-5x4 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 10px;
  max-width: 500px;
  aspect-ratio: 5/4;
}

.grid-6x4 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 8px;
  max-width: 600px;
  aspect-ratio: 6/4;
}

.grid-8x4 {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 6px;
  max-width: 800px;
  aspect-ratio: 8/4;
}

/* 卡片樣式 */
.card {
  position: relative;
  aspect-ratio: 1;
  cursor: pointer;
  perspective: 1000px;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.05);
}

.card.flipped {
  transform: rotateY(180deg);
}

.card.matched {
  transform: rotateY(180deg) scale(1.1);
  filter: brightness(1.2);
}

.card.shake {
  animation: shake 0.5s ease-in-out;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: rotateY(180deg);
}

.card-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.card-text {
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* 匹配效果 */
.match-effect {
  animation: matchEffect 1s ease-out;
}

/* 動畫定義 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes matchEffect {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* 響應式 */
@media (max-width: 768px) {
  .game-grid {
    max-width: 90vw;
  }
  
  .card-text {
    font-size: 1.2rem;
  }
  
  .grid-5x4,
  .grid-6x4,
  .grid-8x4 {
    gap: 6px;
  }
}
</style>