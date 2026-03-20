<template>
  <div class="h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col overflow-hidden relative">
    
    <!-- 星空背景 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div v-for="i in 20" :key="'star'+i" class="absolute bg-white rounded-full animate-twinkle"
           :style="{ width: Math.random()*2+1+'px', height: Math.random()*2+1+'px', left: Math.random()*100+'%', top: Math.random()*60+'%', animationDelay: Math.random()*3+'s' }"></div>
    </div>

    <!-- 顶部 HUD -->
    <div class="relative z-20 px-4 py-2 flex items-center justify-between">
      <button @click="goBack" class="px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-sm backdrop-blur-sm active:bg-white/20">← 返回</button>
      <div class="text-center">
        <div class="text-xs text-white/60">{{ stageTitle }}</div>
        <div class="text-lg font-bold" :class="timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'">
          {{ formatTime(timeLeft) }}
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs text-white/60">得分</div>
        <div class="text-lg font-bold text-yellow-400">{{ score }}</div>
      </div>
    </div>

    <!-- 生命值 + 连击 -->
    <div class="relative z-20 px-4 flex items-center justify-between">
      <div class="flex space-x-1">
        <span v-for="i in maxLives" :key="'l'+i" class="text-lg">{{ i <= lives ? '❤️' : '🖤' }}</span>
      </div>
      <div v-if="combo > 1" class="text-yellow-300 text-sm font-bold animate-bounce">🔥 {{ combo }}连击!</div>
      <div class="flex items-center space-x-1">
        <span class="text-xs text-white/60">进度</span>
        <span class="text-sm font-bold text-green-400">{{ answered }}/{{ totalQuestions }}</span>
      </div>
    </div>

    <!-- 掉落区域 -->
    <div class="flex-1 relative z-10 overflow-hidden" ref="dropZone"
         @touchmove.prevent>
      <!-- 掉落的词 -->
      <div v-for="word in fallingWords" :key="word.id"
           class="absolute left-1/2 -translate-x-1/2 transition-none"
           :style="{ top: word.y + 'px' }">
        <div class="px-6 py-3 rounded-2xl text-center shadow-2xl border-2 min-w-[120px]"
             :class="word.state === 'correct' ? 'bg-green-500 border-green-300 scale-110' : 
                     word.state === 'wrong' ? 'bg-red-500 border-red-300' :
                     'bg-white/95 border-white/50 backdrop-blur-sm'">
          <div class="text-2xl font-bold" :class="word.state ? 'text-white' : 'text-gray-800'">
            {{ word.japanese }}
          </div>
          <div v-if="word.reading && word.reading !== word.japanese" 
               class="text-xs mt-0.5" :class="word.state ? 'text-white/80' : 'text-gray-500'">
            {{ word.reading }}
          </div>
        </div>
      </div>

      <!-- 没接住的效果 -->
      <div v-if="showMiss" class="absolute bottom-20 left-1/2 -translate-x-1/2 text-red-400 text-2xl font-bold animate-fade-up">
        MISS!
      </div>
    </div>

    <!-- 底部选项区 -->
    <div class="relative z-20 bg-black/40 backdrop-blur-md border-t border-white/10 px-4 py-3 pb-6">
      <div class="grid grid-cols-2 gap-3">
        <button v-for="(opt, i) in options" :key="i"
                @click="selectAnswer(i)"
                :disabled="!canAnswer"
                class="py-4 px-3 rounded-2xl text-lg font-bold transition-all duration-150 active:scale-95 border-2"
                :class="optionClass(i)">
          {{ opt }}
        </button>
      </div>
    </div>

    <!-- 游戏结束 -->
    <div v-if="gameEnded" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5">
      <div class="bg-gradient-to-b from-indigo-800 to-purple-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center border border-white/20">
        <div class="text-4xl mb-3">{{ isWin ? '🎉' : '💫' }}</div>
        <h2 class="text-xl font-bold text-white mb-2">{{ isWin ? '词汇雨通关！' : '再接再厉！' }}</h2>
        <div class="flex justify-center space-x-2 mb-4">
          <span v-for="i in 3" :key="i" class="text-3xl" :class="i <= finalStars ? 'text-yellow-400' : 'text-gray-600'">★</span>
        </div>
        <div class="space-y-1 text-sm text-white/70 mb-6">
          <p>得分: <span class="font-bold text-yellow-400 text-lg">{{ score }}</span></p>
          <p>正确: <span class="font-bold text-green-400">{{ correctCount }}/{{ answered }}</span></p>
          <p>最大连击: <span class="font-bold text-orange-400">{{ maxCombo }}</span></p>
        </div>
        <div class="space-y-2">
          <button @click="submitAndBack" :disabled="submitting"
                  class="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl active:scale-95">
            {{ submitting ? '提交中...' : '确认结果' }}
          </button>
          <button @click="restartGame" class="w-full py-2.5 bg-white/10 text-white font-medium rounded-xl border border-white/20">
            再来一局
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  stageConfig: { type: Object, default: null }
})
const emit = defineEmits(['game-complete', 'game-exit'])
const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()

// 配置
const maxLives = 3
const totalTime = 120  // 2分钟
const baseSpeed = 0.4  // 像素/帧 基础速度
const totalQuestions = 20  // 每局20词

// 状态
const score = ref(0)
const lives = ref(maxLives)
const combo = ref(0)
const maxCombo = ref(0)
const correctCount = ref(0)
const answered = ref(0)
const timeLeft = ref(totalTime)
const gameStarted = ref(false)
const gameEnded = ref(false)
const isWin = ref(false)
const finalStars = ref(0)
const submitting = ref(false)
const canAnswer = ref(true)
const showMiss = ref(false)

const fallingWords = ref([])
const options = ref(['', '', '', ''])
const selectedOption = ref(-1)
const correctOption = ref(-1)
const dropZone = ref(null)

const stageTitle = computed(() => props.stageConfig?.title || props.stageConfig?.name_cn || '词汇雨')

// 词汇数据
let allWords = []
let questionQueue = []
let currentWord = null
let wordIdCounter = 0
let animFrame = null
let timerInterval = null
let dropHeight = 500

// 加载词汇
async function loadVocab() {
  try {
    const configData = props.stageConfig?.config_data || props.stageConfig?.game_data || {}
    const parsed = typeof configData === 'string' ? JSON.parse(configData) : configData
    const category = parsed.category || 'mixed'
    
    const baseURL = `http://${window.location.hostname}:3002/api`
    const token = localStorage.getItem('token')
    const res = await fetch(`${baseURL}/vocab/${category}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    
    if (data.success && data.words && data.words.length >= 4) {
      allWords = data.words
    } else {
      allWords = [
        { japanese: '猫', reading: 'ねこ', chinese: '猫', romaji: 'neko' },
        { japanese: '犬', reading: 'いぬ', chinese: '狗', romaji: 'inu' },
        { japanese: '水', reading: 'みず', chinese: '水', romaji: 'mizu' },
        { japanese: '火', reading: 'ひ', chinese: '火', romaji: 'hi' },
      ]
    }
  } catch (e) {
    console.error('加载词汇失败:', e)
    allWords = []
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 准备题目队列
function prepareQuestions() {
  const shuffled = shuffle([...allWords])
  questionQueue = shuffled.slice(0, Math.min(totalQuestions, shuffled.length))
}

// 下一题
function nextQuestion() {
  if (questionQueue.length === 0 || lives.value <= 0) {
    endGame()
    return
  }
  
  currentWord = questionQueue.shift()
  
  // 生成4个选项（1个正确+3个干扰）
  const wrong = allWords.filter(w => w.chinese !== currentWord.chinese)
  const wrongOptions = shuffle(wrong).slice(0, 3).map(w => w.chinese)
  const allOpts = shuffle([currentWord.chinese, ...wrongOptions])
  options.value = allOpts
  correctOption.value = allOpts.indexOf(currentWord.chinese)
  selectedOption.value = -1
  canAnswer.value = true
  
  // 创建掉落词
  fallingWords.value = [{
    id: wordIdCounter++,
    japanese: currentWord.japanese,
    reading: currentWord.reading,
    y: -80,
    state: null,  // null | 'correct' | 'wrong'
    speed: baseSpeed + (answered.value * 0.02)  // 逐渐加速
  }]
}

// 选择答案
function selectAnswer(index) {
  if (!canAnswer.value || gameEnded.value) return
  canAnswer.value = false
  selectedOption.value = index
  answered.value++
  
  const word = fallingWords.value[0]
  if (!word) return
  
  if (index === correctOption.value) {
    // 正确
    word.state = 'correct'
    combo.value++
    if (combo.value > maxCombo.value) maxCombo.value = combo.value
    correctCount.value++
    const points = 100 + Math.min(combo.value - 1, 10) * 20
    score.value += points
    
    // 发音
    speakWord(currentWord)
    
    setTimeout(() => {
      fallingWords.value = []
      nextQuestion()
    }, 600)
  } else {
    // 错误
    word.state = 'wrong'
    combo.value = 0
    lives.value--
    
    setTimeout(() => {
      fallingWords.value = []
      if (lives.value <= 0) {
        endGame()
      } else {
        nextQuestion()
      }
    }, 800)
  }
}

// 动画循环
function gameLoop() {
  if (gameEnded.value) return
  
  fallingWords.value.forEach(word => {
    if (!word.state) {
      word.y += word.speed
      
      // 掉到底了
      if (word.y >= dropHeight - 100) {
        word.state = 'wrong'
        combo.value = 0
        lives.value--
        answered.value++
        canAnswer.value = false
        showMiss.value = true
        setTimeout(() => { showMiss.value = false }, 800)
        
        setTimeout(() => {
          fallingWords.value = []
          if (lives.value <= 0) {
            endGame()
          } else {
            nextQuestion()
          }
        }, 800)
      }
    }
  })
  
  animFrame = requestAnimationFrame(gameLoop)
}

function endGame() {
  gameEnded.value = true
  gameStarted.value = false
  
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null }
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  
  const accuracy = answered.value > 0 ? correctCount.value / answered.value : 0
  isWin.value = accuracy >= 0.5 && lives.value > 0
  
  if (accuracy >= 0.9 && lives.value === maxLives) finalStars.value = 3
  else if (accuracy >= 0.7) finalStars.value = 2
  else if (accuracy >= 0.4) finalStars.value = 1
  else finalStars.value = 0
  
  emit('game-complete', { result: isWin.value ? 'win' : 'lose', score: score.value, stars: finalStars.value })
}

async function submitAndBack() {
  if (submitting.value) return
  submitting.value = true
  
  try {
    if (props.stageConfig?.area_id && props.stageConfig?.stage_id) {
      const result = await gameStore.submitStageResult(props.stageConfig.area_id, props.stageConfig.stage_id, {
        score: score.value, stars: finalStars.value, result: isWin.value ? 'win' : 'lose'
      })
      if (result?.success && result.rewards) {
        authStore.addExp(result.rewards.exp)
        authStore.addCoins(result.rewards.coins)
      }
    }
    router.push(`/game/area/${props.stageConfig?.area_id || 2}/stages`)
  } catch (e) {
    console.error('提交失败:', e)
    router.push(`/game/area/${props.stageConfig?.area_id || 2}/stages`)
  } finally {
    submitting.value = false
  }
}

function restartGame() {
  gameEnded.value = false
  startGame()
}

async function startGame() {
  await loadVocab()
  if (allWords.length < 4) return
  
  score.value = 0
  lives.value = maxLives
  combo.value = 0
  maxCombo.value = 0
  correctCount.value = 0
  answered.value = 0
  timeLeft.value = totalTime
  gameStarted.value = true
  gameEnded.value = false
  fallingWords.value = []
  
  // 计算掉落区域高度
  if (dropZone.value) {
    dropHeight = dropZone.value.clientHeight
  }
  
  prepareQuestions()
  nextQuestion()
  
  // 动画
  if (animFrame) cancelAnimationFrame(animFrame)
  animFrame = requestAnimationFrame(gameLoop)
  
  // 计时器
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) endGame()
  }, 1000)
}

function goBack() {
  if (animFrame) cancelAnimationFrame(animFrame)
  if (timerInterval) clearInterval(timerInterval)
  emit('game-exit')
  router.back()
}

function formatTime(s) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}` }

function speakWord(word) {
  if (!word || !('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(word.reading || word.japanese)
    u.lang = 'ja-JP'
    u.rate = 0.8
    u.volume = 0.8
    speechSynthesis.speak(u)
  }, 50)
}

function optionClass(i) {
  if (selectedOption.value === -1) {
    return 'bg-white/15 border-white/20 text-white hover:bg-white/25'
  }
  if (i === correctOption.value) {
    return 'bg-green-500/80 border-green-400 text-white'
  }
  if (i === selectedOption.value && i !== correctOption.value) {
    return 'bg-red-500/80 border-red-400 text-white'
  }
  return 'bg-white/10 border-white/10 text-white/40'
}

onMounted(() => { startGame() })
onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.animate-twinkle {
  animation: twinkle 2s ease-in-out infinite alternate;
}
@keyframes twinkle {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}
.animate-fade-up {
  animation: fadeUp 0.8s ease-out forwards;
}
@keyframes fadeUp {
  0% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -40px); }
}
</style>
