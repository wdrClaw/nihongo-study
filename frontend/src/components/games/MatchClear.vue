<template>
  <!-- 移动端消消乐游戏 - iPhone 13 Pro Max 优化 -->
  <div class="h-screen flex flex-col bg-gradient-to-br from-background-primary to-background-secondary relative overflow-hidden">
    
    <!-- 樱花飘落装饰 -->
    <div class="bg-sakura absolute inset-0 pointer-events-none z-0"></div>
    
    <!-- 顶部信息栏：固定顶部、关卡名+分数+翻牌数+星级，高度50px -->
    <div class="fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div class="h-[50px] px-5 flex items-center justify-between">
        <!-- 返回按钮 -->
        <button @click="goBack" class="flex items-center space-x-1 touch-target">
          <span class="text-lg">←</span>
        </button>

        <!-- 关卡名 -->
        <div class="flex-1 text-center">
          <h2 class="text-sm font-bold text-text-primary truncate">
            {{ stageConfig.name_cn || '假名消消乐' }}
          </h2>
        </div>

        <!-- 游戏信息 -->
        <div class="flex items-center space-x-3 text-xs">
          <!-- 分数 -->
          <div class="flex flex-col items-center">
            <span class="text-primary-400 font-bold">{{ score }}</span>
            <span class="text-text-secondary">分数</span>
          </div>
          <!-- 翻牌数 -->
          <div class="flex flex-col items-center">
            <span class="text-secondary-500 font-bold">{{ flipCount }}</span>
            <span class="text-text-secondary">翻牌</span>
          </div>
          <!-- 连击 -->
          <div v-if="combo > 1" class="flex flex-col items-center animate-bounce">
            <span class="text-accent-600 font-bold">x{{ combo }}</span>
            <span class="text-accent-500 text-[10px]">连击!</span>
          </div>
          <!-- 星级 -->
          <div class="flex items-center space-x-1">
            <span v-for="i in 3" :key="i" 
                  :class="i <= currentStars ? 'text-yellow-400' : 'text-gray-300'"
                  class="text-base">
              ★
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片网格：居中、间距8px、卡片圆角12px -->
    <div class="flex-1 flex items-center justify-center pt-[66px] pb-8 px-5 relative z-10">
      <div class="w-full max-w-sm">
        <!-- 4×4网格在 428px 宽度下每张卡约 85px -->
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="(card, index) in cards"
            :key="index"
            class="aspect-square bg-white rounded-xl shadow-sm overflow-hidden relative cursor-pointer transition-all duration-300"
            :class="{
              'opacity-50': card.isMatched,
              'scale-95': card.isFlipped && !card.isMatched,
              'animate-pulse': card.isShaking
            }"
            @click="flipCard(index)"
          >
            <!-- 卡片翻转容器 -->
            <div class="w-full h-full relative transform-preserve-3d transition-transform duration-500"
                 :class="{ 'rotate-y-180': card.isFlipped || card.isMatched }">
              
              <!-- 卡片背面 -->
              <div class="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl flex items-center justify-center backface-hidden">
                <span class="text-2xl">🎴</span>
              </div>
              
              <!-- 卡片正面 - 翻转后正面文字必须可见（大字号、高对比度） -->
              <div class="absolute inset-0 rounded-xl flex items-center justify-center backface-hidden rotate-y-180"
                   :class="{
                     'bg-success text-white': card.isMatched,
                     'bg-white text-text-primary border border-gray-200': !card.isMatched
                   }">
                <span class="text-xl font-bold"
                      :class="{
                        'text-white drop-shadow-sm': card.isMatched,
                        'text-text-primary': !card.isMatched
                      }">
                  {{ card.content }}
                </span>
                <!-- 匹配成功标志 -->
                <div v-if="card.isMatched" class="absolute top-1 right-1 text-xs">✨</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 匹配成功动画 -->
    <div v-if="showMatchEffect" class="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div class="text-6xl animate-ping">✨</div>
    </div>

    <!-- 结果弹窗：居中、白色卡片、大按钮 -->
    <div v-if="gameEnded" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
        <!-- 结果图标 -->
        <div class="text-6xl mb-4">{{ gameResult === 'win' ? '🎉' : '😅' }}</div>
        
        <!-- 标题 -->
        <h2 class="text-2xl font-bold mb-4 text-text-primary">
          {{ gameResult === 'win' ? '恭喜完成！' : '时间到！' }}
        </h2>
        
        <!-- 星级显示 -->
        <div class="flex justify-center items-center space-x-1 mb-4">
          <span v-for="i in 3" :key="i" 
                :class="i <= finalStars ? 'text-yellow-400 drop-shadow' : 'text-gray-300'"
                class="text-4xl">
            ★
          </span>
        </div>
        
        <!-- 游戏数据 -->
        <div class="space-y-2 text-text-secondary mb-6">
          <p>最终分数: <span class="font-bold text-primary-400">{{ score }}</span></p>
          <p>翻牌次数: <span class="font-bold text-secondary-500">{{ flipCount }}</span></p>
          <p v-if="totalTime > timeLeft">用时: <span class="font-bold">{{ Math.ceil(totalTime - timeLeft) }}秒</span></p>
        </div>
        
        <!-- 按钮组 -->
        <div class="space-y-3">
          <button @click="submitResult" 
                  :disabled="submitting"
                  class="w-full h-[52px] bg-gradient-to-r from-primary-400 to-primary-500 text-white text-base font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center touch-target disabled:opacity-50">
            {{ submitting ? '提交中...' : '确认结果' }}
          </button>
          
          <button @click="restartGame" 
                  class="w-full h-[48px] bg-white text-text-primary text-base font-semibold rounded-xl border-2 border-gray-200 transition-all duration-300 flex items-center justify-center touch-target hover:bg-gray-50">
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

// 响应式数据
const gameConfig = ref(props.stageConfig.game_config || {})
const gameData = ref(props.stageConfig.game_data || props.stageConfig.game_config || {})
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

// 计算属性
const currentStars = computed(() => {
  const totalCards = cards.value.length
  const totalPairs = totalCards / 2
  const targetFlips = {
    3: totalPairs * 2.5,   // 3星：20次以内（8对×2.5）
    2: totalPairs * 3.5,   // 2星：28次以内
    1: totalPairs * 5.0    // 1星：40次以内
  }
  
  if (flipCount.value <= targetFlips[3]) return 3
  if (flipCount.value <= targetFlips[2]) return 2
  // 通关就至少1星（保证能解锁下一关）
  return 1
})

// 初始化游戏
function initializeGame() {
  // 模拟假名配对数据
  const mockPairs = [
    { hiragana: 'あ', katakana: 'ア', romaji: 'a' },
    { hiragana: 'か', katakana: 'カ', romaji: 'ka' },
    { hiragana: 'さ', katakana: 'サ', romaji: 'sa' },
    { hiragana: 'た', katakana: 'タ', romaji: 'ta' },
    { hiragana: 'な', katakana: 'ナ', romaji: 'na' },
    { hiragana: 'は', katakana: 'ハ', romaji: 'ha' },
    { hiragana: 'ま', katakana: 'マ', romaji: 'ma' },
    { hiragana: 'ら', katakana: 'ラ', romaji: 'ra' }
  ]
  
  const pairs = gameData.value.pairs || mockPairs
  const allCards = []
  
  // 创建卡片对（前8对，16张卡片）
  // 自适应配对模式：
  //   有katakana → 平假名 ↔ 片假名（如：さ ↔ サ）
  //   无katakana → 平假名 ↔ 罗马音（如：あ ↔ a）
  pairs.slice(0, 8).forEach((pair, index) => {
    const hasKatakana = !!pair.katakana
    const secondContent = hasKatakana ? pair.katakana : pair.romaji
    const secondType = hasKatakana ? 'katakana' : 'romaji'
    
    allCards.push(
      { id: index * 2, content: pair.hiragana, pronounce: pair.hiragana, type: 'hiragana', pairId: index, isFlipped: false, isMatched: false, isShaking: false },
      { id: index * 2 + 1, content: secondContent, pronounce: pair.hiragana, type: secondType, pairId: index, isFlipped: false, isMatched: false, isShaking: false }
    )
  })
  
  // 打乱卡片顺序
  cards.value = allCards.sort(() => Math.random() - 0.5)
  
  // 重置游戏状态
  flippedCards.value = []
  score.value = 0
  flipCount.value = 0
  combo.value = 0
  gameEnded.value = false
  isPreview.value = true
  timeLeft.value = totalTime.value
  
  // 开局预览：所有卡片亮起3秒
  cards.value.forEach(c => c.isFlipped = true)
  setTimeout(() => {
    cards.value.forEach(c => { if (!c.isMatched) c.isFlipped = false })
    isPreview.value = false
    startTimer()
  }, 3000)
  
  console.log('🎴 消消乐 - 3秒预览后开始')
}

const combo = ref(0)
const isPreview = ref(true)

// 翻牌逻辑
function flipCard(index) {
  const card = cards.value[index]
  
  // 预览期间 / 已翻 / 已匹配 / 正在判定 / 游戏结束 → 忽略
  if (isPreview.value || card.isFlipped || card.isMatched || flippedCards.value.length >= 2 || gameEnded.value) {
    return
  }
  
  // 翻牌
  card.isFlipped = true
  flippedCards.value.push(index)
  flipCount.value++
  
  // 朗读假名
  speakKana(card.pronounce || card.content)
  
  // 翻了两张 → 立刻判定（不等600ms）
  if (flippedCards.value.length === 2) {
    setTimeout(() => checkMatch(), 400)
  }
}

// 检查匹配
function checkMatch() {
  const [index1, index2] = flippedCards.value
  const card1 = cards.value[index1]
  const card2 = cards.value[index2]
  
  if (card1.pairId === card2.pairId) {
    // ✅ 匹配成功
    card1.isMatched = true
    card2.isMatched = true
    combo.value++
    
    // 连击加分：基础100 + 连击奖励
    const comboBonus = Math.min(combo.value - 1, 5) * 20
    score.value += 100 + comboBonus
    
    // 匹配效果
    showMatchEffect.value = true
    setTimeout(() => { showMatchEffect.value = false }, 600)
    
    // 立刻允许继续翻牌
    flippedCards.value = []
    
    // 全部完成？
    if (cards.value.every(c => c.isMatched)) {
      setTimeout(() => endGame('win'), 500)
    }
  } else {
    // ❌ 匹配失败
    combo.value = 0
    card1.isShaking = true
    card2.isShaking = true
    
    // 显示1.2秒让玩家记住位置，然后翻回
    setTimeout(() => {
      card1.isFlipped = false
      card2.isFlipped = false
      card1.isShaking = false
      card2.isShaking = false
      flippedCards.value = []
    }, 1200)
  }
}

// 结束游戏
function endGame(result) {
  gameResult.value = result
  gameEnded.value = true
  finalStars.value = result === 'win' ? currentStars.value : 0
  
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// 重新开始
// 开始计时
function startTimer() {
  if (timer.value) clearInterval(timer.value)
  timer.value = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timer.value)
      timer.value = null
      endGame('timeout')
    }
  }, 1000)
}

function restartGame() {
  initializeGame()
}

// 提交结果
async function submitResult() {
  if (submitting.value) return
  
  submitting.value = true
  
  try {
    const areaId = props.stageConfig.area_id || 1
    const stageId = props.stageConfig.stage_id || 1
    
    const result = await gameStore.submitStageResult(areaId, stageId, {
      score: score.value,
      stars: finalStars.value,
      time_spent: totalTime.value - timeLeft.value,
      flip_count: flipCount.value,
      combo_max: combo.value
    })
    
    if (result.success) {
      console.log('🎯 游戏结果提交成功:', result)
      // 如果升级了，显示提示
      if (result.data?.leveled_up) {
        alert(`🎉 升级了！等级 ${result.data.new_level}`)
      }
    }
    
    // 返回关卡选择页
    router.push(`/game/area/${areaId}/stages`)
    
  } catch (error) {
    console.error('提交结果失败:', error)
    alert('提交结果失败，请重试')
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

// 朗读假名（浏览器语音优先，Google TTS备选）
const jaVoiceCache = ref(null)
function getJaVoice() {
  if (jaVoiceCache.value) return jaVoiceCache.value
  if (!('speechSynthesis' in window)) return null
  const voices = speechSynthesis.getVoices()
  jaVoiceCache.value = voices.find(v => v.lang === 'ja-JP') || voices.find(v => v.lang.startsWith('ja')) || null
  return jaVoiceCache.value
}
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => { jaVoiceCache.value = null }
}

function speakKana(text) {
  if (!text) return
  
  const voice = getJaVoice()
  if (voice && 'speechSynthesis' in window) {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    u.voice = voice
    u.rate = 0.8
    u.pitch = 1.0
    u.volume = 0.8
    speechSynthesis.speak(u)
  } else {
    // 备选 Google TTS
    try {
      const audio = new Audio(
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(text)}`
      )
      audio.volume = 0.8
      audio.play().catch(() => {})
    } catch (e) {}
  }
}

// 生命周期
onMounted(() => {
  console.log('🎮 消消乐组件已挂载 - iPhone 适配版')
  initializeGame()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
/* 3D 变换工具类 */
.transform-preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

/* 触控目标优化 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>