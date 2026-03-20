<template>
  <div class="h-screen bg-gradient-to-b from-background-primary to-background-secondary flex flex-col overflow-hidden">
    <!-- 顶部信息栏 -->
    <div class="bg-white/90 backdrop-blur-sm shadow-sm px-4 py-2 relative z-20">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="px-3 py-1.5 rounded-lg bg-gray-100 active:bg-gray-200 text-sm">← 返回</button>
        <div class="text-center">
          <div class="text-xs text-text-secondary">{{ stageTitle }}</div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-1">
            <span v-for="i in 3" :key="'h'+i" class="text-lg">{{ i <= (3 - mistakes) ? '❤️' : '🖤' }}</span>
          </div>
          <div class="text-lg font-bold text-primary-400">{{ score }}</div>
        </div>
      </div>
      <!-- 星级 -->
      <div class="flex items-center space-x-2 mt-1">
        <div class="flex space-x-0.5">
          <span v-for="i in 3" :key="i" class="text-sm" :class="i <= currentStars ? 'text-yellow-400' : 'text-gray-300'">★</span>
        </div>
        <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300"
               :style="{ width: sentenceProgress + '%' }"></div>
        </div>
        <span class="text-xs text-text-secondary">{{ currentIndex + 1 }}/{{ totalSentences }}</span>
      </div>
    </div>

    <!-- 目标句子区 -->
    <div class="px-4 py-3">
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p class="text-xs text-text-light mb-1">🇨🇳 目标句子</p>
        <p class="text-lg font-bold text-text-primary mb-3">{{ currentSentence.chinese }}</p>
        <!-- 已组装的日语 -->
        <div class="min-h-[48px] bg-gray-50 rounded-xl p-3 flex flex-wrap gap-2 items-center border-2 border-dashed"
             :class="assembleState === 'correct' ? 'border-green-400 bg-green-50' : assembleState === 'wrong' ? 'border-red-400 bg-red-50' : 'border-gray-200'">
          <template v-if="collectedWords.length === 0">
            <span class="text-gray-400 text-sm">按顺序点击下方词块组句…</span>
          </template>
          <div v-for="(word, i) in collectedWords" :key="'c'+i"
               @click="removeWord(i)"
               class="px-3 py-1.5 bg-primary-400 text-white rounded-lg text-base font-bold cursor-pointer active:scale-95 transition-transform">
            {{ word }}
          </div>
        </div>
      </div>
    </div>

    <!-- 词块选择区 -->
    <div class="flex-1 px-4 flex items-center">
      <div class="w-full flex flex-wrap gap-3 justify-center">
        <button v-for="bubble in wordBubbles" :key="bubble.id"
                @click="collectWordBubble(bubble)"
                :disabled="bubble.collected || bubble.disabled"
                class="px-5 py-3 rounded-2xl text-lg font-bold shadow-md transition-all duration-200 active:scale-90"
                :class="bubbleClass(bubble)">
          {{ bubble.text }}
        </button>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="px-4 pb-6 pt-2">
      <div class="flex space-x-3">
        <button @click="clearCollected" 
                :disabled="collectedWords.length === 0"
                class="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
                :class="collectedWords.length > 0 ? 'bg-gray-200 text-text-primary active:bg-gray-300' : 'bg-gray-100 text-gray-400'">
          🔄 重来
        </button>
        <button @click="confirmAnswer" 
                :disabled="collectedWords.length !== correctSequence.length"
                class="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
                :class="collectedWords.length === correctSequence.length ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white active:scale-95' : 'bg-gray-100 text-gray-400'">
          ✅ 确认
        </button>
      </div>
    </div>

    <!-- 游戏结束弹窗 -->
    <div v-if="gameEnded" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div class="text-4xl mb-3">{{ gameResult === 'win' ? '🎉' : '💪' }}</div>
        <h2 class="text-xl font-bold text-text-primary mb-2">
          {{ gameResult === 'win' ? '语法跑酷完成！' : '关卡失败' }}
        </h2>
        <div class="flex justify-center space-x-2 mb-4">
          <span v-for="i in 3" :key="i" class="text-3xl" :class="i <= finalStars ? 'text-yellow-400' : 'text-gray-300'">★</span>
        </div>
        <div class="space-y-1 text-sm text-text-secondary mb-6">
          <p>得分: <span class="font-bold text-primary-400 text-lg">{{ score }}</span></p>
          <p>失误: <span class="font-bold">{{ mistakes }}</span> 次</p>
          <p>完成: <span class="font-bold">{{ completedCount }}/{{ totalSentences }}</span> 句</p>
        </div>
        <div class="space-y-2">
          <button @click="submitResult" :disabled="submitting"
                  class="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-bold rounded-2xl">
            {{ submitting ? '提交中...' : '确认结果' }}
          </button>
          <button @click="restartGame" class="w-full py-2.5 bg-white text-text-primary font-medium rounded-xl border-2 border-gray-200">
            重新挑战
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  stageConfig: { type: Object, required: true }
})

const emit = defineEmits(['game-complete', 'game-exit'])
const gameStore = useGameStore()
const authStore = useAuthStore()
const router = useRouter()

// 游戏数据
const gameData = ref(props.stageConfig.game_data || props.stageConfig.game_config || {})
const stageTitle = computed(() => props.stageConfig.name_cn || props.stageConfig.title || '语法跑酷')

// 句子列表
const sentences = ref([])
const currentIndex = ref(0)
const totalSentences = computed(() => sentences.value.length)
const completedCount = ref(0)

// 当前句子状态
const currentSentence = ref({ chinese: '', japanese_words: [], distractors: [] })
const wordBubbles = ref([])
const collectedWords = ref([])
const correctSequence = ref([])
const assembleState = ref('') // '' | 'correct' | 'wrong'

// 游戏状态
const gameStarted = ref(false)
const gameEnded = ref(false)
const gameResult = ref('')
const finalStars = ref(0)
const submitting = ref(false)
const score = ref(0)
const mistakes = ref(0)

const currentStars = computed(() => {
  if (mistakes.value === 0) return 3
  if (mistakes.value === 1) return 2
  if (mistakes.value <= 2) return 1
  return 0
})

const sentenceProgress = computed(() => {
  if (totalSentences.value === 0) return 0
  return (completedCount.value / totalSentences.value) * 100
})

// 初始化
function initializeGame() {
  const rawSentences = gameData.value.sentences || [
    { chinese: '我在学校学日语', japanese_words: ['私は', '学校で', '日本語を', '勉強します'], distractors: ['勉強しません', '学校に'] },
    { chinese: '今天天气很好', japanese_words: ['今日は', '天気が', 'いいです'], distractors: ['悪いです', '今日の'] },
    { chinese: '我喜欢吃寿司', japanese_words: ['私は', '寿司が', '好きです'], distractors: ['嫌いです', '寿司を'] },
  ]
  
  sentences.value = rawSentences
  currentIndex.value = 0
  completedCount.value = 0
  score.value = 0
  mistakes.value = 0
  gameEnded.value = false
  gameStarted.value = true
  
  loadSentence(0)
}

function loadSentence(index) {
  if (index >= sentences.value.length) {
    endGame('win')
    return
  }
  
  const s = sentences.value[index]
  currentSentence.value = s
  correctSequence.value = [...s.japanese_words]
  collectedWords.value = []
  assembleState.value = ''
  
  // 把正确词和干扰词混在一起打乱
  const allWords = [...s.japanese_words, ...(s.distractors || [])]
  const shuffled = allWords.sort(() => Math.random() - 0.5)
  
  wordBubbles.value = shuffled.map((word, i) => ({
    id: i,
    text: word,
    collected: false,
    wrong: false,
    disabled: false,
    isCorrect: s.japanese_words.includes(word)
  }))
}

function bubbleClass(bubble) {
  if (bubble.collected) return 'bg-gray-200 text-gray-400 scale-90 opacity-50'
  if (bubble.wrong) return 'bg-red-100 border-2 border-red-400 text-red-600 animate-shake'
  return 'bg-white border-2 border-gray-200 text-text-primary hover:border-primary-300'
}

// 点击词块
function collectWordBubble(bubble) {
  if (bubble.collected || bubble.disabled || gameEnded.value) return
  
  bubble.collected = true
  collectedWords.value.push(bubble.text)
  
  // 发音
  speakWord(bubble.text)
}

// 点击已组装词移除
function removeWord(index) {
  const word = collectedWords.value.splice(index, 1)[0]
  assembleState.value = ''
  // 恢复词块
  const bubble = wordBubbles.value.find(b => b.text === word && b.collected)
  if (bubble) bubble.collected = false
}

// 清空已组装
function clearCollected() {
  collectedWords.value = []
  assembleState.value = ''
  wordBubbles.value.forEach(b => { b.collected = false; b.wrong = false })
}

// 确认答案
function confirmAnswer() {
  const isCorrect = collectedWords.value.length === correctSequence.value.length &&
    collectedWords.value.every((w, i) => w === correctSequence.value[i])
  
  if (isCorrect) {
    assembleState.value = 'correct'
    score.value += 100 * (3 - mistakes.value + 1)
    completedCount.value++
    
    // 朗读完整句子
    speakWord(collectedWords.value.join(''))
    
    // 延迟进入下一句
    setTimeout(() => {
      currentIndex.value++
      loadSentence(currentIndex.value)
    }, 1500)
  } else {
    assembleState.value = 'wrong'
    mistakes.value++
    
    // 标记错误的词
    setTimeout(() => { assembleState.value = '' }, 1000)
    
    if (mistakes.value >= 3) {
      setTimeout(() => endGame('fail'), 500)
    }
  }
}

function endGame(result) {
  gameResult.value = result
  gameEnded.value = true
  gameStarted.value = false
  finalStars.value = result === 'win' ? currentStars.value : Math.max(0, currentStars.value - 1)
  
  emit('game-complete', {
    result,
    score: score.value,
    stars: finalStars.value
  })
}

async function submitResult() {
  if (submitting.value) return
  submitting.value = true
  
  try {
    const result = await gameStore.submitStageResult(
      props.stageConfig.area_id,
      props.stageConfig.stage_id,
      { score: score.value, stars: finalStars.value, result: gameResult.value === 'win' ? 'win' : 'lose' }
    )
    if (result.success) {
      if (result.rewards) {
        authStore.addExp(result.rewards.exp)
        authStore.addCoins(result.rewards.coins)
      }
      router.push(`/game/area/${props.stageConfig.area_id}/stages`)
    }
  } catch (e) {
    console.error('提交失败:', e)
    alert('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

function restartGame() {
  gameEnded.value = false
  initializeGame()
}

function goBack() {
  emit('game-exit')
  router.back()
}

function speakWord(text) {
  if (!text || !('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    u.rate = 0.8
    u.volume = 0.8
    speechSynthesis.speak(u)
  }, 50)
}

onMounted(() => {
  initializeGame()
})
</script>

<style scoped>
.animate-shake {
  animation: shake 0.5s ease-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}
</style>
