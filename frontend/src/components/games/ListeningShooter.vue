<template>
  <div class="listening-shooter-game h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
    <!-- 背景裝飾 -->
    <div class="absolute inset-0">
      <!-- 動態背景場景 -->
      <div class="scene-background w-full h-full" :class="currentScene.bgClass">
        <div class="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
        <div class="absolute top-1/3 right-10 w-16 h-16 bg-pink-200 rounded-full opacity-40 animate-bounce"></div>
        <div class="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-200 rounded-full opacity-35 animate-pulse"></div>
      </div>
    </div>

    <!-- 頂部信息欄 -->
    <div class="relative z-10 flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm">
      <!-- 返回按鈕 -->
      <button @click="goBack" class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
        <span>←</span>
        <span>返回</span>
      </button>

      <!-- 場景標題 -->
      <div class="flex items-center space-x-2">
        <span class="text-2xl">{{ currentScene.icon }}</span>
        <h2 class="text-lg font-bold text-gray-800">{{ currentScene.name }}</h2>
      </div>

      <!-- 遊戲信息 -->
      <div class="flex items-center space-x-6">
        <!-- 生命值 -->
        <div class="flex items-center space-x-1">
          <span v-for="i in 3" :key="i" class="text-2xl">
            {{ i <= lives ? '❤️' : '💔' }}
          </span>
        </div>

        <!-- 連擊數 -->
        <div v-if="comboCount > 0" class="flex items-center space-x-2">
          <span>🔥</span>
          <span class="text-xl font-bold text-red-600">{{ comboCount }}連擊</span>
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

    <!-- 中央操作區域 -->
    <div class="flex-1 flex flex-col justify-center items-center relative z-10 p-4">
      <!-- 音頻控制區 -->
      <div class="audio-control mb-8">
        <div class="bg-white/90 rounded-2xl p-6 shadow-lg text-center">
          <div class="mb-4">
            <div :class="[
              'w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl transition-all duration-300',
              isPlaying ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600'
            ]">
              🔊
            </div>
          </div>
          
          <div class="space-y-3">
            <button @click="playAudio" 
                    :disabled="isPlaying || gameEnded"
                    class="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-bold transition-colors">
              {{ isPlaying ? '播放中...' : '🎧 播放音頻' }}
            </button>
            
            <button v-if="remainingReplays > 0" @click="replayAudio"
                    :disabled="isPlaying || gameEnded"
                    class="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors">
              🔄 重播 ({{ remainingReplays }}次剩餘)
            </button>
          </div>
        </div>
      </div>

      <!-- 氣球射擊區域 -->
      <div class="balloon-area w-full h-96 relative">
        <!-- 子彈時間效果 -->
        <div v-if="bulletTimeActive" class="absolute inset-0 bg-blue-500/20 backdrop-blur-sm rounded-lg z-10 pointer-events-none">
          <div class="absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-bold">
            <span class="text-xl animate-pulse">⚡ 子彈時間 ⚡</span>
          </div>
        </div>

        <!-- 氣球 -->
        <div
          v-for="balloon in balloons"
          :key="balloon.id"
          :class="[
            'balloon absolute cursor-pointer transition-all duration-300',
            { 'bullet-time': bulletTimeActive }
          ]"
          :style="{
            left: balloon.x + 'px',
            bottom: balloon.y + 'px',
            transform: `scale(${balloon.scale})`,
            animationDuration: balloon.speed + 's'
          }"
          @click="shootBalloon(balloon)"
        >
          <div :class="[
            'balloon-content w-20 h-28 rounded-full flex flex-col items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 hover:scale-110',
            balloon.type === 'bomb' ? 'bg-red-500 animate-pulse' : balloon.color
          ]">
            <!-- 氣球線 -->
            <div class="balloon-string absolute bottom-0 w-0.5 h-8 bg-gray-400 transform translate-y-full"></div>
            
            <!-- 內容 -->
            <span v-if="balloon.type === 'bomb'" class="text-2xl">💣</span>
            <span v-else class="text-center px-2 break-words">{{ balloon.text }}</span>
          </div>
        </div>

        <!-- 射擊效果 -->
        <div
          v-for="effect in shootEffects"
          :key="effect.id"
          class="shoot-effect absolute pointer-events-none z-20"
          :style="{ left: effect.x + 'px', bottom: effect.y + 'px' }"
        >
          <span class="text-3xl animate-ping">{{ effect.type === 'correct' ? '✨' : '💥' }}</span>
        </div>
      </div>
    </div>

    <!-- 答題提示 -->
    <div v-if="currentQuestion && !gameEnded" class="relative z-10 p-4 bg-white/80 backdrop-blur-sm">
      <div class="text-center">
        <p class="text-lg text-gray-600">{{ currentQuestion.prompt }}</p>
      </div>
    </div>

    <!-- 遊戲結束彈窗 -->
    <div v-if="gameEnded" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="mb-6">
          <div class="text-6xl mb-4">{{ gameResult === 'win' ? '🎊' : '😔' }}</div>
          <h2 class="text-2xl font-bold mb-2">
            {{ gameResult === 'win' ? '射擊完成！' : '遊戲結束' }}
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
            <p>最高連擊: <span class="font-bold">{{ maxCombo }}</span></p>
            <p>正確率: <span class="font-bold">{{ Math.round(correctAnswers / totalAnswers * 100) || 0 }}%</span></p>
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

    <!-- 音頻元素 -->
    <audio ref="questionAudio" @ended="onAudioEnded"></audio>

    <!-- 音效播放器 -->
    <audio ref="shootAudio" preload="auto">
      <source src="/sounds/balloon-pop.mp3" type="audio/mpeg">
    </audio>
    <audio ref="wrongAudio" preload="auto">
      <source src="/sounds/wrong-shot.mp3" type="audio/mpeg">
    </audio>
    <audio ref="comboAudio" preload="auto">
      <source src="/sounds/combo-effect.mp3" type="audio/mpeg">
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

// 場景配置
const scenes = {
  convenience_store: { name: '便利店', icon: '🏪', bgClass: 'bg-gradient-to-b from-blue-100 to-green-100' },
  station: { name: '車站', icon: '🚉', bgClass: 'bg-gradient-to-b from-gray-100 to-blue-100' },
  restaurant: { name: '餐廳', icon: '🍽️', bgClass: 'bg-gradient-to-b from-orange-100 to-red-100' },
  phone: { name: '電話', icon: '📱', bgClass: 'bg-gradient-to-b from-purple-100 to-pink-100' }
}

const currentScene = ref(scenes.convenience_store)

// 問題和音頻
const questions = ref([])
const currentQuestionIndex = ref(0)
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const remainingReplays = ref(2)
const isPlaying = ref(false)

// 氣球和射擊
const balloons = ref([])
const shootEffects = ref([])
const balloonIdCounter = ref(0)

// 遊戲數據
const lives = ref(3)
const score = ref(0)
const comboCount = ref(0)
const maxCombo = ref(0)
const correctAnswers = ref(0)
const totalAnswers = ref(0)
const bulletTimeActive = ref(false)

// 動畫和計時器
const balloonSpawner = ref(null)
const effectCleaner = ref(null)

// 音頻ref
const questionAudio = ref(null)
const shootAudio = ref(null)
const wrongAudio = ref(null)
const comboAudio = ref(null)

// 計算屬性
const currentStars = computed(() => {
  const accuracy = correctAnswers.value / Math.max(totalAnswers.value, 1)
  if (accuracy >= 0.9 && lives.value === 3) return 3
  if (accuracy >= 0.8 && lives.value >= 2) return 2
  if (accuracy >= 0.6) return 1
  return 0
})

// 初始化遊戲
function initializeGame() {
  // 設置場景
  const sceneName = gameData.value.scene || 'convenience_store'
  currentScene.value = scenes[sceneName] || scenes.convenience_store
  
  // 加載問題
  questions.value = gameData.value.questions || [
    {
      audio_url: '',
      text: 'いらっしゃいませ',
      prompt: '請點擊正確的中文意思',
      options: ['歡迎光臨', '謝謝', '再見', '不好意思'],
      correct_answer: '歡迎光臨'
    }
  ]
  
  // 重置狀態
  currentQuestionIndex.value = 0
  remainingReplays.value = 2
  lives.value = 3
  score.value = 0
  comboCount.value = 0
  maxCombo.value = 0
  correctAnswers.value = 0
  totalAnswers.value = 0
  bulletTimeActive.value = false
  balloons.value = []
  shootEffects.value = []
  gameEnded.value = false
  gameStarted.value = true
  
  // 開始第一個問題
  startQuestion()
}

// 開始問題
function startQuestion() {
  if (currentQuestionIndex.value >= questions.value.length) {
    endGame('win')
    return
  }
  
  remainingReplays.value = 2
  playAudio()
}

// 播放音頻
function playAudio() {
  if (isPlaying.value || !currentQuestion.value) return
  
  isPlaying.value = true
  
  // 如果有音頻文件，播放文件；否則使用TTS
  if (currentQuestion.value.audio_url) {
    questionAudio.value.src = currentQuestion.value.audio_url
    questionAudio.value.play().catch(() => {
      // 降級到TTS
      playTTS()
    })
  } else {
    playTTS()
  }
}

// TTS播放
function playTTS() {
  if ('speechSynthesis' in window && currentQuestion.value.text) {
    const utterance = new SpeechSynthesisUtterance(currentQuestion.value.text)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.8
    utterance.onend = () => onAudioEnded()
    speechSynthesis.speak(utterance)
  } else {
    // 如果TTS也不可用，直接開始遊戲
    onAudioEnded()
  }
}

// 重播音頻
function replayAudio() {
  if (remainingReplays.value > 0) {
    remainingReplays.value--
    playAudio()
  }
}

// 音頻播放結束
function onAudioEnded() {
  isPlaying.value = false
  spawnBalloons()
}

// 生成氣球
function spawnBalloons() {
  if (!currentQuestion.value) return
  
  const options = currentQuestion.value.options || []
  const balloonCount = Math.min(options.length + 1, 6)  // 最多6個氣球
  
  // 清空現有氣球
  balloons.value = []
  
  // 添加正確選項氣球
  options.forEach((option, index) => {
    const balloon = createBalloon(option, option === currentQuestion.value.correct_answer)
    balloons.value.push(balloon)
  })
  
  // 隨機添加炸彈氣球
  if (Math.random() < 0.3) {
    const bombBalloon = createBalloon('💣', false, 'bomb')
    balloons.value.push(bombBalloon)
  }
  
  // 啟動氣球動畫
  startBalloonAnimation()
}

// 創建氣球
function createBalloon(text, isCorrect, type = 'normal') {
  const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400']
  
  return {
    id: balloonIdCounter.value++,
    text,
    type,
    isCorrect,
    x: Math.random() * (window.innerWidth - 100),  // 隨機X位置
    y: -50,  // 從底部開始
    scale: 0.8 + Math.random() * 0.4,  // 隨機大小
    speed: 3 + Math.random() * 4,  // 上升速度
    color: type === 'bomb' ? 'bg-red-500' : colors[Math.floor(Math.random() * colors.length)]
  }
}

// 啟動氣球動畫
function startBalloonAnimation() {
  balloonSpawner.value = setInterval(() => {
    balloons.value.forEach(balloon => {
      balloon.y += 2 * (bulletTimeActive.value ? 0.5 : 1)  // 子彈時間減速
      
      // 移除飄出螢幕的氣球
      if (balloon.y > window.innerHeight + 100) {
        const index = balloons.value.indexOf(balloon)
        if (index > -1) {
          balloons.value.splice(index, 1)
        }
      }
    })
    
    // 檢查是否需要結束當前問題
    if (balloons.value.length === 0) {
      nextQuestion()
    }
  }, 50)
}

// 射擊氣球
function shootBalloon(balloon) {
  const index = balloons.value.indexOf(balloon)
  if (index === -1) return
  
  totalAnswers.value++
  
  // 創建射擊效果
  const effect = {
    id: Date.now(),
    x: balloon.x + 40,
    y: balloon.y + 60,
    type: balloon.isCorrect ? 'correct' : 'wrong'
  }
  shootEffects.value.push(effect)
  
  // 清理效果
  setTimeout(() => {
    const effectIndex = shootEffects.value.indexOf(effect)
    if (effectIndex > -1) {
      shootEffects.value.splice(effectIndex, 1)
    }
  }, 1000)
  
  // 移除氣球
  balloons.value.splice(index, 1)
  
  if (balloon.type === 'bomb') {
    // 炸彈氣球
    handleBombHit()
  } else if (balloon.isCorrect) {
    // 正確答案
    handleCorrectAnswer()
  } else {
    // 錯誤答案
    handleWrongAnswer()
  }
}

// 處理正確答案
function handleCorrectAnswer() {
  correctAnswers.value++
  comboCount.value++
  maxCombo.value = Math.max(maxCombo.value, comboCount.value)
  
  // 計分（連擊加成）
  const baseScore = 100
  const comboBonus = Math.floor(comboCount.value * 0.5)
  score.value += baseScore + comboBonus
  
  // 播放音效
  playSound('shoot')
  
  // 檢查子彈時間
  if (comboCount.value % 3 === 0 && comboCount.value > 0) {
    activateBulletTime()
  }
  
  // 移除所有氣球（正確答案後）
  balloons.value = []
  clearInterval(balloonSpawner.value)
  
  // 進入下一題
  setTimeout(() => {
    nextQuestion()
  }, 1000)
}

// 處理錯誤答案
function handleWrongAnswer() {
  comboCount.value = 0
  playSound('wrong')
}

// 處理炸彈
function handleBombHit() {
  lives.value--
  comboCount.value = 0
  playSound('wrong')
  
  if (lives.value <= 0) {
    endGame('fail')
  }
}

// 激活子彈時間
function activateBulletTime() {
  bulletTimeActive.value = true
  playSound('combo')
  
  setTimeout(() => {
    bulletTimeActive.value = false
  }, 3000)
}

// 下一個問題
function nextQuestion() {
  clearInterval(balloonSpawner.value)
  currentQuestionIndex.value++
  
  setTimeout(() => {
    startQuestion()
  }, 1500)
}

// 結束遊戲
function endGame(result) {
  gameResult.value = result
  gameEnded.value = true
  finalStars.value = currentStars.value
  gameStarted.value = false
  
  if (balloonSpawner.value) {
    clearInterval(balloonSpawner.value)
  }
}

// 播放音效
function playSound(type) {
  if (!gameStore.gameSettings?.soundEnabled) return
  
  try {
    const audioMap = {
      shoot: shootAudio,
      wrong: wrongAudio,
      combo: comboAudio
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
        time_spent: 0,
        stars: finalStars.value,
        answers: {
          correct_answers: correctAnswers.value,
          total_answers: totalAnswers.value,
          max_combo: maxCombo.value,
          scene: currentScene.value.name,
          game_type: 'listening_shooter'
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
  if (balloonSpawner.value) {
    clearInterval(balloonSpawner.value)
  }
  router.back()
}

// 生命週期
onMounted(() => {
  initializeGame()
})

onUnmounted(() => {
  if (balloonSpawner.value) {
    clearInterval(balloonSpawner.value)
  }
  if (effectCleaner.value) {
    clearInterval(effectCleaner.value)
  }
})
</script>

<style scoped>
/* 場景背景 */
.scene-background {
  transition: all 0.5s ease;
}

/* 氣球動畫 */
.balloon {
  animation: balloonFloat linear infinite;
  animation-direction: reverse;
}

.balloon.bullet-time {
  animation-duration: 8s !important;  /* 子彈時間減速 */
}

@keyframes balloonFloat {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100vh);
  }
}

.balloon-content:hover {
  animation: balloonWiggle 0.5s ease-in-out;
}

@keyframes balloonWiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

/* 射擊效果 */
.shoot-effect {
  animation: shootEffect 1s ease-out;
  pointer-events: none;
}

@keyframes shootEffect {
  0% {
    transform: scale(0.5);
    opacity: 1;
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

/* 子彈時間效果 */
.bullet-time {
  filter: hue-rotate(180deg) brightness(1.2);
}

/* 氣球線 */
.balloon-string {
  background: linear-gradient(to bottom, transparent, #666);
}

/* 響應式 */
@media (max-width: 768px) {
  .balloon-content {
    width: 60px;
    height: 80px;
    font-size: 12px;
  }
  
  .audio-control {
    margin-bottom: 24px;
  }
  
  .balloon-area {
    height: 300px;
  }
}

/* 音頻控制動畫 */
.audio-control button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.audio-control button:active {
  transform: translateY(0);
}
</style>