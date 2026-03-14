<template>
  <div class="grammar-runner-game h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
    <!-- 背景裝飾 -->
    <div class="absolute inset-0">
      <div class="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-30 animate-pulse"></div>
      <div class="absolute top-1/3 right-10 w-16 h-16 bg-blue-200 rounded-full opacity-40 animate-bounce"></div>
      <div class="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-200 rounded-full opacity-35 animate-pulse"></div>
      
      <!-- 背景滾動軌道 -->
      <div class="absolute bottom-0 left-0 w-full h-32">
        <div class="track-bg w-full h-full bg-gradient-to-t from-gray-300 to-gray-100 opacity-50"
             :style="{ transform: `translateX(${-backgroundOffset}px)` }"></div>
      </div>
    </div>

    <!-- 頂部信息欄 -->
    <div class="relative z-10 flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm">
      <!-- 返回按鈕 -->
      <button @click="goBack" class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
        <span>←</span>
        <span>返回</span>
      </button>

      <!-- 目標句子 -->
      <div class="flex-1 mx-4">
        <div class="bg-white/90 rounded-lg p-3 border-2 border-blue-200">
          <p class="text-sm text-gray-600 mb-1">目標句子：</p>
          <p class="text-lg font-bold text-blue-800">{{ currentSentence.chinese }}</p>
          <!-- 組裝的日語句子 -->
          <div class="mt-2 min-h-[2rem] border-t pt-2">
            <p v-if="collectedWords.length === 0" class="text-gray-400 text-sm">點擊詞塊按順序收集...</p>
            <p v-else class="text-xl font-bold text-green-600">
              {{ collectedWords.join(' ') }}
            </p>
          </div>
        </div>
      </div>

      <!-- 遊戲信息 -->
      <div class="flex items-center space-x-6">
        <!-- 失誤次數 -->
        <div class="flex items-center space-x-2">
          <span>❌</span>
          <span class="text-lg font-bold text-red-600">{{ mistakes }}/3</span>
        </div>

        <!-- 分數 -->
        <div class="flex items-center space-x-2">
          <span>🎯</span>
          <span class="text-xl font-bold text-blue-600">{{ score }}</span>
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
    <div class="flex-1 relative z-10 overflow-hidden">
      <!-- 角色（固定在左側） -->
      <div class="absolute left-10 top-1/2 transform -translate-y-1/2 z-20">
        <div class="character-container">
          <div :class="[
            'character w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-500',
            { 'animate-bounce': !isStumbling && gameStarted, 'animate-pulse bg-red-500': isStumbling }
          ]">
            {{ isStumbling ? '😵' : '🏃' }}
          </div>
          <!-- 跑步煙塵效果 -->
          <div v-if="!isStumbling && gameStarted" class="dust-effect absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div class="w-2 h-2 bg-gray-300 rounded-full opacity-50 animate-ping"></div>
          </div>
        </div>
      </div>

      <!-- 詞塊氣泡區域 -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          v-for="bubble in wordBubbles"
          :key="bubble.id"
          :class="[
            'word-bubble absolute pointer-events-auto cursor-pointer transition-all duration-300',
            { 'collected': bubble.collected, 'wrong': bubble.wrong, 'disabled': bubble.disabled }
          ]"
          :style="{
            left: bubble.x + 'px',
            top: bubble.y + 'px',
            transform: `translateY(${bubble.floatOffset}px)`
          }"
          @click="collectWordBubble(bubble)"
        >
          <div class="bubble-inner bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all">
            <span class="text-lg font-bold text-gray-800">{{ bubble.text }}</span>
          </div>
        </div>
      </div>

      <!-- 跑道 -->
      <div class="absolute bottom-0 left-0 w-full h-2 bg-gray-400 opacity-50"></div>
    </div>

    <!-- 成功動畫效果 -->
    <div v-if="showSuccessEffect" class="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div class="success-effect animate-ping">
        <span class="text-6xl">🎉</span>
      </div>
    </div>

    <!-- 跌倒效果 -->
    <div v-if="showStumbleEffect" class="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div class="stumble-effect">
        <span class="text-4xl animate-bounce text-red-500">💥</span>
        <p class="text-xl font-bold text-red-500 mt-2">點錯了！</p>
      </div>
    </div>

    <!-- 遊戲結束彈窗 -->
    <div v-if="gameEnded" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="mb-6">
          <div class="text-6xl mb-4">{{ gameResult === 'win' ? '🎊' : '😔' }}</div>
          <h2 class="text-2xl font-bold mb-2">
            {{ gameResult === 'win' ? '語法跑酷完成！' : '關卡失敗' }}
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
            <p>失誤次數: <span class="font-bold">{{ mistakes }}</span></p>
            <p v-if="gameResult === 'win'">完整句子: <span class="font-bold text-green-600">{{ completedSentence }}</span></p>
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
    <audio ref="collectAudio" preload="auto">
      <source src="/sounds/collect-word.mp3" type="audio/mpeg">
    </audio>
    <audio ref="wrongAudio" preload="auto">
      <source src="/sounds/wrong-choice.mp3" type="audio/mpeg">
    </audio>
    <audio ref="completeAudio" preload="auto">
      <source src="/sounds/sentence-complete.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
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
const gameData = ref(props.stageConfig.game_data || props.stageConfig.game_config)

// 遊戲狀態
const gameStarted = ref(false)
const gameEnded = ref(false)
const gameResult = ref('')
const finalStars = ref(0)
const submitting = ref(false)

// 當前句子和詞塊
const currentSentence = ref({})
const wordBubbles = ref([])
const collectedWords = ref([])
const correctSequence = ref([])

// 遊戲數據
const score = ref(0)
const mistakes = ref(0)
const isStumbling = ref(false)
const showSuccessEffect = ref(false)
const showStumbleEffect = ref(false)
const completedSentence = ref('')

// 動畫相關
const backgroundOffset = ref(0)
const animationFrame = ref(null)

// 音頻ref
const collectAudio = ref(null)
const wrongAudio = ref(null)
const completeAudio = ref(null)

// 計算屬性
const currentStars = computed(() => {
  if (mistakes.value === 0) return 3  // 完美
  if (mistakes.value === 1) return 2  // 良好
  if (mistakes.value === 2) return 1  // 及格
  return 0  // 失敗
})

// 初始化遊戲
function initializeGame() {
  // 選擇當前句子（根據難度）
  const sentences = gameData.value.sentences || [
    {
      chinese: "我在學校學日語",
      japanese_words: ["私は", "学校で", "日本語を", "勉強します"],
      distractors: ["勉強しません", "学校に", "日本語が"]
    }
  ]
  
  currentSentence.value = sentences[0]  // 簡化：取第一個句子
  correctSequence.value = [...currentSentence.value.japanese_words]
  
  // 創建詞塊氣泡
  createWordBubbles()
  
  // 重置狀態
  collectedWords.value = []
  score.value = 0
  mistakes.value = 0
  gameEnded.value = false
  gameStarted.value = true
  isStumbling.value = false
  
  // 啟動動畫
  startBackgroundAnimation()
  startBubbleAnimation()
}

// 創建詞塊氣泡
function createWordBubbles() {
  const correctWords = currentSentence.value.japanese_words || []
  const distractors = currentSentence.value.distractors || []
  const allWords = [...correctWords, ...distractors]
  
  wordBubbles.value = allWords.map((word, index) => ({
    id: index,
    text: word,
    x: 200 + Math.random() * 600,  // 隨機X位置
    y: 100 + Math.random() * 300,  // 隨機Y位置
    floatOffset: 0,
    collected: false,
    wrong: false,
    disabled: false,
    isCorrect: correctWords.includes(word),
    correctIndex: correctWords.indexOf(word)
  }))
}

// 收集詞塊
function collectWordBubble(bubble) {
  if (bubble.collected || bubble.disabled || gameEnded.value) return
  
  const expectedWord = correctSequence.value[collectedWords.value.length]
  
  if (bubble.text === expectedWord) {
    // 正確收集
    bubble.collected = true
    collectedWords.value.push(bubble.text)
    score.value += 100
    
    // 播放收集音效
    playSound('collect')
    
    // 顯示成功效果
    showSuccessEffect.value = true
    setTimeout(() => { showSuccessEffect.value = false }, 800)
    
    // 檢查是否完成句子
    if (collectedWords.value.length === correctSequence.value.length) {
      completeSentence()
    }
  } else {
    // 錯誤收集
    handleMistake(bubble)
  }
}

// 處理錯誤
function handleMistake(bubble) {
  mistakes.value++
  
  // 標記錯誤氣泡
  bubble.wrong = true
  setTimeout(() => { bubble.wrong = false }, 1000)
  
  // 角色跌倒
  isStumbling.value = true
  setTimeout(() => { isStumbling.value = false }, 2000)
  
  // 顯示跌倒效果
  showStumbleEffect.value = true
  setTimeout(() => { showStumbleEffect.value = false }, 1500)
  
  // 播放錯誤音效
  playSound('wrong')
  
  // 檢查失敗條件
  if (mistakes.value >= 3) {
    endGame('fail')
  }
}

// 完成句子
function completeSentence() {
  completedSentence.value = collectedWords.value.join(' ')
  
  // 播放完成音效
  playSound('complete')
  
  // TTS朗讀句子
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(completedSentence.value)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
  
  // 延遲結束（等待TTS）
  setTimeout(() => {
    endGame('win')
  }, 2000)
}

// 背景動畫
function startBackgroundAnimation() {
  function animate() {
    backgroundOffset.value += 2  // 背景滾動速度
    animationFrame.value = requestAnimationFrame(animate)
  }
  animate()
}

// 氣泡浮動動畫
function startBubbleAnimation() {
  function animateBubbles() {
    wordBubbles.value.forEach((bubble, index) => {
      if (!bubble.collected) {
        bubble.floatOffset = Math.sin(Date.now() * 0.003 + index) * 8  // 浮動效果
      }
    })
    
    if (gameStarted.value && !gameEnded.value) {
      requestAnimationFrame(animateBubbles)
    }
  }
  animateBubbles()
}

// 結束遊戲
function endGame(result) {
  gameResult.value = result
  gameEnded.value = true
  finalStars.value = result === 'win' ? currentStars.value : 0
  gameStarted.value = false
  
  // 停止動畫
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
}

// 播放音效
function playSound(type) {
  if (!gameStore.gameSettings?.soundEnabled) return
  
  try {
    const audioMap = {
      collect: collectAudio,
      wrong: wrongAudio,
      complete: completeAudio
    }
    
    const audio = audioMap[type]?.value
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(e => {
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
        time_spent: 0,  // 跑酷模式不計時
        stars: finalStars.value,
        answers: {
          mistakes: mistakes.value,
          completed_sentence: completedSentence.value,
          game_type: 'grammar_runner'
        }
      }
    )
    
    if (result.success) {
      authStore.addExp(result.rewards.exp)
      authStore.addCoins(result.rewards.coins)
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
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  router.back()
}

// 生命週期
onMounted(() => {
  initializeGame()
})

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
})
</script>

<style scoped>
/* 軌道背景 */
.track-bg {
  background-image: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 18px,
    rgba(0, 0, 0, 0.1) 18px,
    rgba(0, 0, 0, 0.1) 20px
  );
}

/* 角色動畫 */
.character-container {
  position: relative;
}

/* 詞塊氣泡 */
.word-bubble {
  user-select: none;
}

.word-bubble:hover .bubble-inner {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.word-bubble.collected .bubble-inner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  animation: collectPulse 0.5s ease-out;
}

.word-bubble.wrong .bubble-inner {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  animation: wrongShake 0.5s ease-out;
}

.word-bubble.disabled .bubble-inner {
  opacity: 0.5;
  pointer-events: none;
}

/* 動畫效果 */
@keyframes collectPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1.05); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.success-effect {
  animation: successEffect 0.8s ease-out;
}

.stumble-effect {
  animation: stumbleEffect 1.5s ease-out;
}

@keyframes successEffect {
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

@keyframes stumbleEffect {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-50px);
    opacity: 0;
  }
}

/* 響應式 */
@media (max-width: 768px) {
  .word-bubble .bubble-inner {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .character {
    width: 48px !important;
    height: 48px !important;
    font-size: 18px !important;
  }
}
</style>