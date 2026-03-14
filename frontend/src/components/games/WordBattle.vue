<template>
  <div class="word-battle h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 relative overflow-hidden">
    <!-- 戰鬥背景效果 -->
    <div class="absolute inset-0">
      <div v-for="i in 20" :key="i" 
           class="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-twinkle"
           :style="{ 
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             animationDelay: Math.random() * 2 + 's'
           }">
      </div>
    </div>

    <!-- 頂部狀態欄 -->
    <div class="relative z-10 flex justify-between items-center p-4 bg-black/50 backdrop-blur-sm">
      <!-- 返回按鈕 -->
      <button @click="goBack" class="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
        <span>←</span>
        <span>返回</span>
      </button>

      <!-- 關卡標題 -->
      <div class="flex items-center space-x-2">
        <h2 class="text-lg font-bold text-white">{{ props.stageConfig.title || props.stageConfig.name_cn || 'BOSS戰鬥' }}</h2>
      </div>

      <!-- 玩家狀態 -->
      <div class="flex items-center space-x-6">
        <!-- 生命值 -->
        <div class="flex items-center space-x-2">
          <span v-for="i in 3" :key="i" 
                :class="i <= playerHP ? 'text-red-500' : 'text-gray-500'"
                class="text-2xl">
            ❤️
          </span>
        </div>

        <!-- 連擊數 -->
        <div v-if="combo > 1" class="flex items-center space-x-2 animate-pulse">
          <span class="text-yellow-400">🔥</span>
          <span class="text-xl font-bold text-yellow-400">{{ combo }}連擊</span>
          <span class="text-sm text-yellow-300">{{ comboMultiplier }}x</span>
        </div>

        <!-- 問題計數 -->
        <div class="text-white">
          <span class="text-lg">{{ currentQuestion }}/{{ totalQuestions }}</span>
        </div>
      </div>
    </div>

    <!-- 戰鬥區域 -->
    <div class="flex-1 flex flex-col items-center justify-center p-4">
      
      <!-- BOSS區域 -->
      <div class="boss-area mb-8">
        <div class="text-center mb-4">
          <h2 class="text-2xl font-bold text-white mb-2">{{ boss.name_cn }}</h2>
          <p class="text-gray-300 text-sm">{{ boss.description_cn }}</p>
        </div>
        
        <!-- BOSS血條 -->
        <div class="boss-hp-container bg-gray-800 rounded-full p-2 mb-6 w-80 mx-auto">
          <div class="bg-red-600 h-6 rounded-full relative overflow-hidden transition-all duration-500"
               :style="{ width: (bossHP / boss.max_hp) * 100 + '%' }">
            <div class="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700"></div>
            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
          <div class="text-center text-white text-sm mt-1">
            {{ bossHP }}/{{ boss.max_hp }} HP
          </div>
        </div>

        <!-- BOSS精靈 -->
        <div class="boss-sprite relative mx-auto w-32 h-32 mb-6">
          <div class="boss-character text-8xl animate-bounce"
               :class="{ 
                 'animate-shake': bossIsHit,
                 'grayscale animate-pulse': bossIsDefeated 
               }">
            {{ getBossEmoji() }}
          </div>
          
          <!-- 攻擊特效 -->
          <div v-if="bossIsAttacking" class="absolute inset-0 flex items-center justify-center">
            <div class="attack-effect text-6xl animate-ping">⚡</div>
          </div>
        </div>
      </div>

      <!-- 問題區域 -->
      <div class="question-area bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl w-full">
        
        <!-- 倒計時 -->
        <div class="text-center mb-4">
          <div class="inline-block bg-black/50 rounded-full px-4 py-2">
            <span class="text-2xl font-bold" 
                  :class="timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-white'">
              {{ Math.ceil(timeLeft) }}
            </span>
          </div>
        </div>

        <!-- 當前問題 -->
        <div v-if="currentQuestionData" class="text-center mb-6">
          <div class="flex items-center justify-center space-x-4 mb-4">
            <h3 class="text-4xl font-bold text-white">{{ currentQuestionData.japanese }}</h3>
            <button v-if="currentQuestionData.audio_url" 
                    @click="playWordAudio"
                    class="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors">
              🔊
            </button>
          </div>
          
          <p v-if="currentQuestionData.hiragana" class="text-xl text-gray-300 mb-4">
            {{ currentQuestionData.hiragana }}
          </p>
        </div>

        <!-- 選擇選項 -->
        <div class="grid grid-cols-2 gap-4" v-if="currentQuestionData">
          <button
            v-for="(option, index) in currentQuestionData.options"
            :key="index"
            @click="selectOption(option)"
            :disabled="answering || gameEnded"
            :class="[
              'option-button',
              {
                'correct': showResult && option === currentQuestionData.correct_answer,
                'incorrect': showResult && option === selectedOption && option !== currentQuestionData.correct_answer,
                'disabled': answering || gameEnded,
                'rotating': boss.special_abilities?.rotate_options && isRotating
              }
            ]"
          >
            {{ option }}
          </button>
        </div>

        <!-- 結果反饋 -->
        <div v-if="showResult" class="text-center mt-6">
          <div class="text-2xl mb-2">
            {{ isCorrect ? '✅ 正確！' : '❌ 錯誤！' }}
          </div>
          <div v-if="!isCorrect" class="text-white">
            正確答案：{{ currentQuestionData.correct_answer }}
          </div>
        </div>
      </div>
    </div>

    <!-- 戰鬥結束彈窗 -->
    <div v-if="gameEnded" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="mb-6">
          <div class="text-8xl mb-4">{{ gameResult === 'win' ? '🎉' : '💀' }}</div>
          <h2 class="text-2xl font-bold mb-2">
            {{ gameResult === 'win' ? 'BOSS擊敗！' : '戰鬥失敗...' }}
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
            <p>最高連擊: <span class="font-bold text-orange-600">{{ maxCombo }}</span></p>
            <p>正確率: <span class="font-bold text-green-600">{{ Math.round(correctAnswers / totalQuestions * 100) }}%</span></p>
            <p>總分: <span class="font-bold text-blue-600">{{ finalScore }}</span></p>
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
    <audio ref="attackAudio" preload="auto">
      <source src="/sounds/sword-attack.mp3" type="audio/mpeg">
    </audio>
    <audio ref="hitAudio" preload="auto">
      <source src="/sounds/boss-hit.mp3" type="audio/mpeg">
    </audio>
    <audio ref="bossAttackAudio" preload="auto">
      <source src="/sounds/boss-attack.mp3" type="audio/mpeg">
    </audio>
    <audio ref="victoryAudio" preload="auto">
      <source src="/sounds/victory.mp3" type="audio/mpeg">
    </audio>
    <audio ref="defeatAudio" preload="auto">
      <source src="/sounds/defeat.mp3" type="audio/mpeg">
    </audio>
    <audio ref="wordAudio" preload="auto">
      <source :src="currentQuestionData?.audio_url" type="audio/mpeg" v-if="currentQuestionData?.audio_url">
    </audio>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
const boss = ref(props.stageConfig.game_data.boss)
const questions = ref(props.stageConfig.game_data.questions)
const timePerQuestion = ref(props.stageConfig.game_data.time_per_question || 8)

const bossHP = ref(boss.value.max_hp)
const playerHP = ref(3)
const currentQuestion = ref(1)
const totalQuestions = ref(questions.value.length)
const currentQuestionData = ref(null)
const timeLeft = ref(timePerQuestion.value)
const selectedOption = ref('')
const isCorrect = ref(false)
const showResult = ref(false)
const answering = ref(false)
const gameEnded = ref(false)
const gameResult = ref('')
const finalStars = ref(0)
const finalScore = ref(0)
const submitting = ref(false)

// 戰鬥狀態
const combo = ref(0)
const maxCombo = ref(0)
const correctAnswers = ref(0)
const comboMultiplier = computed(() => {
  if (combo.value >= 5) return 3
  if (combo.value >= 3) return 2
  if (combo.value >= 2) return 1.5
  return 1
})

// 動畫狀態
const bossIsHit = ref(false)
const bossIsAttacking = ref(false)
const bossIsDefeated = ref(false)
const isRotating = ref(false)

// 定時器
const questionTimer = ref(null)
const rotationTimer = ref(null)

// 音頻ref
const attackAudio = ref(null)
const hitAudio = ref(null)
const bossAttackAudio = ref(null)
const victoryAudio = ref(null)
const defeatAudio = ref(null)
const wordAudio = ref(null)

// 計算屬性
const currentStars = computed(() => {
  if (gameResult.value !== 'win') return 0
  
  const accuracy = correctAnswers.value / totalQuestions.value
  const comboBonus = maxCombo.value >= 5 ? 1 : 0
  
  if (accuracy >= 0.9 && maxCombo.value >= 3) return 3
  if (accuracy >= 0.8) return 2
  if (accuracy >= 0.6) return 1
  return 0
})

// 初始化遊戲
function initializeGame() {
  // 重置狀態
  bossHP.value = boss.value.max_hp
  playerHP.value = 3
  currentQuestion.value = 1
  combo.value = 0
  maxCombo.value = 0
  correctAnswers.value = 0
  gameEnded.value = false
  bossIsDefeated.value = false
  
  // 開始第一題
  loadNextQuestion()
}

// 載入下一題
function loadNextQuestion() {
  if (currentQuestion.value > totalQuestions.value) {
    // 所有問題完成
    endGame(bossHP.value <= 0 ? 'win' : 'lose')
    return
  }
  
  currentQuestionData.value = questions.value[currentQuestion.value - 1]
  timeLeft.value = timePerQuestion.value
  selectedOption.value = ''
  showResult.value = false
  answering.value = false
  
  // 特殊能力：旋轉選項
  if (boss.value.special_abilities?.rotate_options) {
    startRotation()
  }
  
  // 啟動倒計時
  startQuestionTimer()
}

// 啟動問題計時器
function startQuestionTimer() {
  questionTimer.value = setInterval(() => {
    timeLeft.value--
    
    if (timeLeft.value <= 0) {
      // 時間到，算錯誤
      selectOption(null)
    }
  }, 1000)
}

// 選擇選項
function selectOption(option) {
  if (answering.value || gameEnded.value) return
  
  // 停止計時器
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
    questionTimer.value = null
  }
  
  // 停止旋轉
  if (rotationTimer.value) {
    clearInterval(rotationTimer.value)
    rotationTimer.value = null
    isRotating.value = false
  }
  
  answering.value = true
  selectedOption.value = option
  isCorrect.value = option === currentQuestionData.value.correct_answer
  showResult.value = true
  
  if (isCorrect.value) {
    // 答對
    correctAnswers.value++
    combo.value++
    maxCombo.value = Math.max(maxCombo.value, combo.value)
    
    // 攻擊BOSS
    attackBoss()
    
    // 自動播放正確發音
    setTimeout(() => {
      playWordAudio()
    }, 500)
    
  } else {
    // 答錯
    combo.value = 0
    
    // BOSS攻擊玩家
    bossAttackPlayer()
  }
  
  // 2秒後進入下一題
  setTimeout(() => {
    currentQuestion.value++
    loadNextQuestion()
  }, 2000)
}

// 攻擊BOSS
function attackBoss() {
  const damage = Math.floor(comboMultiplier.value)
  bossHP.value = Math.max(0, bossHP.value - damage)
  
  // 顯示BOSS受擊動畫
  bossIsHit.value = true
  setTimeout(() => {
    bossIsHit.value = false
  }, 500)
  
  // 播放攻擊音效
  playSound('attack')
  
  // 檢查BOSS是否被擊敗
  if (bossHP.value <= 0) {
    bossIsDefeated.value = true
    endGame('win')
  }
}

// BOSS攻擊玩家
function bossAttackPlayer() {
  playerHP.value = Math.max(0, playerHP.value - 1)
  
  // 顯示BOSS攻擊動畫
  bossIsAttacking.value = true
  setTimeout(() => {
    bossIsAttacking.value = false
  }, 800)
  
  // 播放BOSS攻擊音效
  playSound('bossAttack')
  
  // 檢查玩家是否死亡
  if (playerHP.value <= 0) {
    endGame('lose')
  }
}

// 開始旋轉效果
function startRotation() {
  isRotating.value = true
  
  rotationTimer.value = setInterval(() => {
    if (currentQuestionData.value && currentQuestionData.value.options) {
      // 隨機打亂選項順序
      const options = [...currentQuestionData.value.options]
      currentQuestionData.value.options = options.sort(() => Math.random() - 0.5)
    }
  }, boss.value.special_abilities?.rotation_speed * 1000 || 2000)
}

// 獲取BOSS表情
function getBossEmoji() {
  switch (boss.value.code) {
    case 'lost_cat': return '🐱'
    case 'sushi_master': return '🍣'
    case 'kanji_demon': return '👹'
    case 'time_lord': return '⏰'
    case 'particle_ninja': return '🥷'
    case 'conjugation_wave': return '🌊'
    default: return '👾'
  }
}

// 播放單詞發音
function playWordAudio() {
  if (wordAudio.value && currentQuestionData.value?.audio_url) {
    wordAudio.value.currentTime = 0
    wordAudio.value.play().catch(e => console.log('發音播放失敗:', e))
  }
}

// 播放音效
function playSound(type) {
  if (!gameStore.gameSettings?.soundEnabled) return
  
  try {
    const audioMap = {
      attack: attackAudio,
      hit: hitAudio,
      bossAttack: bossAttackAudio,
      victory: victoryAudio,
      defeat: defeatAudio
    }
    
    const audio = audioMap[type]?.value
    if (audio) {
      // 檢查音頻文件是否可用
      if (audio.readyState === 0) {
        console.log(`音效文件 ${type} 不可用，靜默跳過`)
        return
      }
      
      audio.currentTime = 0
      audio.play().catch(e => console.log(`音效 ${type} 播放跳過:`, e.message))
    }
  } catch (error) {
    console.log('音效播放跳過:', error.message)
  }
}

// 結束遊戲
function endGame(result) {
  gameResult.value = result
  gameEnded.value = true
  finalStars.value = currentStars.value
  
  // 計算最終分數
  let baseScore = correctAnswers.value * 100
  let comboBonus = maxCombo.value * 50
  finalScore.value = baseScore + comboBonus
  
  // 清除定時器
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
    questionTimer.value = null
  }
  if (rotationTimer.value) {
    clearInterval(rotationTimer.value)
    rotationTimer.value = null
  }
  
  // 播放結束音效
  playSound(result === 'win' ? 'victory' : 'defeat')
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
        score: finalScore.value,
        time_spent: totalQuestions.value * timePerQuestion.value,
        stars: finalStars.value,
        answers: {
          correct_answers: correctAnswers.value,
          total_questions: totalQuestions.value,
          max_combo: maxCombo.value,
          boss_defeated: gameResult.value === 'win'
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
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
  }
  if (rotationTimer.value) {
    clearInterval(rotationTimer.value)
  }
  router.back()
}

// 生命週期
onMounted(() => {
  initializeGame()
})

onUnmounted(() => {
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
  }
  if (rotationTimer.value) {
    clearInterval(rotationTimer.value)
  }
})
</script>

<style scoped>
/* 閃爍動畫 */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

.animate-twinkle {
  animation: twinkle 2s infinite;
}

/* 震動動畫 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* 選項按鈕樣式 */
.option-button {
  @apply px-6 py-4 bg-white/90 hover:bg-white text-gray-800 rounded-lg font-medium transition-all duration-200 transform hover:scale-105;
}

.option-button.correct {
  @apply bg-green-500 text-white;
}

.option-button.incorrect {
  @apply bg-red-500 text-white;
}

.option-button.disabled {
  @apply opacity-50 cursor-not-allowed transform-none;
}

.option-button.rotating {
  animation: wiggle 0.3s ease-in-out infinite;
}

/* 擺動動畫（旋轉效果） */
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}

/* BOSS精靈容器 */
.boss-character {
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
  transition: all 0.3s ease;
}

/* 攻擊特效 */
.attack-effect {
  filter: drop-shadow(0 0 10px #fbbf24);
}

/* 響應式 */
@media (max-width: 768px) {
  .boss-hp-container {
    width: 240px;
  }
  
  .boss-sprite {
    width: 100px;
    height: 100px;
  }
  
  .boss-character {
    font-size: 4rem;
  }
  
  .grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 3;
  }
  
  .option-button {
    font-size: 0.9rem;
    padding: 1rem 1.5rem;
  }
}
</style>