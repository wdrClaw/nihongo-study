<template>
  <div class="match-clear-game h-screen flex flex-col bg-game-match relative overflow-hidden">
    <!-- 浮动假名/樱花瓣背景装饰 -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- 浮动假名字符 -->
      <div v-for="i in 15" :key="'kana-' + i"
           class="absolute animate-kana-float text-2xl opacity-10 pointer-events-none select-none"
           :style="{
             left: Math.random() * 100 + '%',
             animationDelay: Math.random() * 5 + 's',
             animationDuration: (Math.random() * 3 + 4) + 's'
           }">
        {{ getRandomKana() }}
      </div>
      
      <!-- 樱花瓣装饰 -->
      <div v-for="i in 8" :key="'sakura-' + i"
           class="absolute animate-sakura-fall text-pink-300/40 pointer-events-none"
           :style="{
             left: Math.random() * 100 + '%',
             animationDelay: Math.random() * 6 + 's',
             animationDuration: (Math.random() * 4 + 6) + 's',
             fontSize: '1.2rem'
           }">
        🌸
      </div>
      
      <!-- 能量粒子效果 -->
      <div class="particle-container">
        <div v-for="i in 20" :key="'particle-' + i"
             class="particle"
             :style="{
               left: Math.random() * 100 + '%',
               top: Math.random() * 100 + '%',
               animationDelay: Math.random() * 3 + 's'
             }">
        </div>
      </div>
    </div>

    <!-- 顶部信息栏 - 毛玻璃效果 -->
    <div class="relative z-20 glass-card border-b border-white/30 shadow-lg">
      <div class="flex justify-between items-center p-4">
        <!-- 返回按钮 -->
        <button @click="goBack" class="game-button-secondary flex items-center space-x-2 interactive">
          <span class="text-lg">←</span>
          <span>返回</span>
        </button>

        <!-- 关卡标题 - 发光设计 -->
        <div class="flex items-center space-x-2">
          <div class="text-2xl animate-pulse-glow">🎴</div>
          <h2 class="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            {{ stageConfig.title || stageConfig.name_cn || '假名消消乐' }}
          </h2>
        </div>

        <!-- 游戏信息栏 -->
        <div class="flex items-center space-x-4">
          <!-- 时间 - 警告闪烁效果 -->
          <div v-if="gameConfig.mode !== 'basic'" class="game-info-item">
            <div class="info-icon text-2xl" :class="{ 'animate-bounce': timeLeft <= 10 }">⏱️</div>
            <div class="info-content">
              <div class="info-label">时间</div>
              <div class="info-value" :class="{ 
                'text-red-500 animate-pulse glow-red': timeLeft <= 30,
                'text-orange-500': timeLeft <= 60 && timeLeft > 30,
                'text-green-500': timeLeft > 60
              }">
                {{ Math.ceil(timeLeft) }}s
              </div>
            </div>
          </div>

          <!-- 分数 - 弹跳动画 -->
          <div class="game-info-item">
            <div class="info-icon text-2xl animate-float">🎯</div>
            <div class="info-content">
              <div class="info-label">分数</div>
              <div class="info-value text-blue-600 font-bold count-bounce">{{ score }}</div>
            </div>
          </div>

          <!-- 翻牌次数 -->
          <div class="game-info-item">
            <div class="info-icon text-2xl">🔄</div>
            <div class="info-content">
              <div class="info-label">翻牌</div>
              <div class="info-value text-purple-600">{{ flipCount }}</div>
            </div>
          </div>

          <!-- 星级预览 - 闪烁星星 -->
          <div class="game-info-item">
            <div class="info-content">
              <div class="info-label">星级</div>
              <div class="flex space-x-1">
                <span v-for="i in 3" :key="i" 
                      :class="i <= currentStars ? 'text-yellow-400 animate-pulse star-earned' : 'text-gray-300'"
                      class="text-lg transition-all duration-300">
                  ⭐
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏区域 - 3D卡片系统 -->
    <div class="flex-1 flex items-center justify-center p-4 relative z-10">
      <div class="game-grid w-full" :class="gridClass">
        <div
          v-for="(card, index) in cards"
          :key="index"
          :class="[
            'game-card-3d',
            'card',
            {
              'flipped': card.isFlipped || card.isMatched,
              'matched': card.isMatched,
              'shake': card.isShaking,
              'glow-match': card.isMatched,
              'card-hover': !card.isFlipped && !card.isMatched
            }
          ]"
          @click="flipCard(index)"
          @mouseenter="onCardHover(index)"
        >
          <div class="card-inner">
            <!-- 卡片背面 - 精致渐变 -->
            <div class="card-back">
              <!-- 背面装饰 -->
              <div class="card-pattern"></div>
              <div class="card-border-glow"></div>
              <span class="text-4xl relative z-10">🎴</span>
              <!-- 悬浮提示 -->
              <div class="card-hint">?</div>
            </div>
            
            <!-- 卡片正面 - 发光文字 -->
            <div class="card-front" :class="getCardFrontStyle(card)">
              <!-- 匹配成功特效背景 -->
              <div v-if="card.isMatched" class="match-success-bg"></div>
              
              <!-- 文字内容 -->
              <span class="card-text" :class="{ 'matched-text': card.isMatched }">
                {{ card.content }}
              </span>
              
              <!-- 匹配成功徽章 -->
              <div v-if="card.isMatched" class="match-badge">
                ✨
              </div>
            </div>
          </div>
          
          <!-- 点击波纹效果 -->
          <div class="card-ripple"></div>
          
          <!-- 匹配成功光环 -->
          <div v-if="card.isMatched" class="match-aura"></div>
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

// 音頻ref
const flipAudio = ref(null)
const matchAudio = ref(null)
const completeAudio = ref(null)

// 計算屬性
const gridClass = computed(() => {
  const gridSize = gameConfig.value.grid_size
  if (gridSize === '4x4') return 'grid-4x4'
  if (gridSize === '5x4') return 'grid-5x4'
  if (gridSize === '6x4') return 'grid-6x4'
  if (gridSize === '8x4') return 'grid-8x4'
  return 'grid-4x4'
})

// 新增方法 - 游戏化UI增强
// 获取随机假名字符
const kanaChars = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'が', 'ざ', 'だ', 'ば', 'ぱ', 'ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ', 'ワ']
function getRandomKana() {
  return kanaChars[Math.floor(Math.random() * kanaChars.length)]
}

// 卡片悬浮效果
function onCardHover(index) {
  const card = cards.value[index]
  if (!card.isFlipped && !card.isMatched) {
    // 添加悬浮音效（可选）
    // playSound('hover')
  }
}

// 获取卡片正面样式
function getCardFrontStyle(card) {
  if (card.isMatched) {
    return 'card-front-matched'
  }
  return 'card-front-normal'
}

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
      flip: flipAudio,
      match: matchAudio, 
      complete: completeAudio
    }
    
    const audio = audioMap[type]?.value
    if (audio) {
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
/* === 游戏背景系统 === */
.bg-game-match {
  background: linear-gradient(135deg, 
    #E0F2FE 0%,     /* 天蓝 */
    #DBEAFE 25%,    /* 浅蓝 */
    #F3E8FF 50%,    /* 浅紫 */
    #FFEFD5 75%,    /* 浅橙 */
    #FDF2F8 100%    /* 浅粉 */
  );
  position: relative;
  animation: backgroundShift 30s ease-in-out infinite;
}

@keyframes backgroundShift {
  0%, 100% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(15deg) brightness(1.1); }
}

/* 假名漂浮动画 */
@keyframes kanaFloat {
  0% { 
    transform: translateY(100vh) rotateZ(0deg);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { 
    transform: translateY(-100px) rotateZ(360deg);
    opacity: 0;
  }
}

.animate-kana-float {
  animation: kanaFloat linear infinite;
  pointer-events: none;
  user-select: none;
}

/* 粒子系统 */
.particle-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #FFB7C5, transparent);
  border-radius: 50%;
  animation: particleFloat 4s ease-in-out infinite;
}

@keyframes particleFloat {
  0%, 100% { 
    transform: translateY(0) scale(0.5); 
    opacity: 0.3; 
  }
  50% { 
    transform: translateY(-20px) scale(1); 
    opacity: 0.8; 
  }
}

/* === 顶部信息栏样式 === */
.game-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.game-info-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.info-icon {
  transition: transform 0.3s ease;
}

.info-content {
  text-align: center;
}

.info-label {
  font-size: 0.7rem;
  color: #6B7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
}

/* 发光警告效果 */
.glow-red {
  text-shadow: 0 0 10px #EF4444;
  animation: redPulse 1s ease-in-out infinite;
}

@keyframes redPulse {
  0%, 100% { text-shadow: 0 0 5px #EF4444; }
  50% { text-shadow: 0 0 20px #EF4444, 0 0 30px #EF4444; }
}

/* 分数弹跳动画 */
.count-bounce {
  animation: scoreUp 0.5s var(--ease-bounce);
}

@keyframes scoreUp {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 星星获得动画 */
.star-earned {
  animation: starEarn 0.8s ease-out;
}

@keyframes starEarn {
  0% { transform: scale(0) rotateZ(-180deg); opacity: 0; }
  60% { transform: scale(1.3) rotateZ(0deg); opacity: 1; }
  100% { transform: scale(1) rotateZ(0deg); opacity: 1; }
}

/* === 游戏网格 === */
.game-grid {
  margin: 0 auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.grid-4x4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 500px;
  width: 100%;
}

.grid-5x4 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  max-width: 600px;
  width: 100%;
}

.grid-6x4 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  max-width: 700px;
  width: 100%;
}

.grid-8x4 {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  max-width: 900px;
  width: 100%;
}

/* === 3D卡片系统 === */
.card {
  position: relative;
  aspect-ratio: 1;
  min-width: 60px;
  min-height: 60px;
  cursor: pointer;
  perspective: 1000px;
  transition: all 0.3s var(--ease-smooth);
}

.card-hover:hover {
  transform: translateY(-4px) scale(1.05);
  z-index: 10;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s var(--ease-bounce);
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card.matched .card-inner {
  transform: rotateY(180deg) scale(1.1);
}

.card.shake .card-inner {
  animation: cardShake 0.6s ease-in-out;
}

@keyframes cardShake {
  0%, 100% { transform: rotateY(180deg) translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: rotateY(180deg) translateX(-8px); }
  20%, 40%, 60%, 80% { transform: rotateY(180deg) translateX(8px); }
}

/* 卡片面设计 */
.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

/* 卡片背面 - 精致渐变 */
.card-back {
  background: linear-gradient(135deg, #FF6B9D 0%, #C084FC 50%, #60A5FA 100%);
  position: relative;
}

.card-pattern {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 25%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 25%);
  border-radius: 16px;
}

.card-border-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #FF6B9D, #C084FC, #60A5FA, #FF6B9D);
  border-radius: 18px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .card-border-glow {
  opacity: 0.6;
  animation: borderRotate 3s linear infinite;
}

@keyframes borderRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.card-hint {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #6B7280;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .card-hint {
  opacity: 1;
}

/* 卡片正面 */
.card-front {
  transform: rotateY(180deg);
}

.card-front-normal {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
}

.card-front-matched {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-color: #10B981;
}

.match-success-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  animation: successPulse 2s ease-in-out infinite;
}

@keyframes successPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.card-text {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
}

.matched-text {
  color: #FFF;
  text-shadow: 
    0 0 10px rgba(255, 255, 255, 0.8),
    2px 2px 6px rgba(0, 0, 0, 0.4);
  animation: textGlow 2s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.match-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 1.2rem;
  animation: badgeSpin 2s linear infinite;
}

@keyframes badgeSpin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

/* 点击波纹效果 */
.card-ripple {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  border-radius: 16px;
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
}

.card:active .card-ripple {
  animation: rippleEffect 0.6s ease-out;
}

@keyframes rippleEffect {
  to {
    transform: scale(2);
    opacity: 1;
  }
}

/* 匹配成功光环 */
.match-aura {
  position: absolute;
  inset: -4px;
  background: linear-gradient(45deg, #FFD700, transparent, #FFD700);
  border-radius: 20px;
  animation: auraRotate 3s linear infinite;
  z-index: -1;
}

@keyframes auraRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.glow-match {
  filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.6));
}

/* 匹配成功特效 */
.match-effect {
  background: radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,165,0,0.6) 40%, transparent 70%);
  width: 300px;
  height: 300px;
  border-radius: 50%;
  position: relative;
  animation: matchExplosion 1s ease-out;
}

@keyframes matchExplosion {
  0% { transform: scale(0); opacity: 1; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

.match-effect::before {
  content: '';
  position: absolute;
  inset: 20px;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 50%);
  border-radius: 50%;
  animation: innerGlow 1s ease-out;
}

@keyframes innerGlow {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
}

/* === 响应式设计 === */
@media (max-width: 768px) {
  .grid-4x4 {
    gap: 12px;
    max-width: 400px;
  }
  
  .grid-5x4 {
    gap: 8px;
    max-width: 450px;
  }
  
  .grid-6x4 {
    gap: 6px;
    max-width: 500px;
  }
  
  .grid-8x4 {
    gap: 4px;
    max-width: 600px;
  }
  
  .card {
    min-width: 50px;
    min-height: 50px;
  }
  
  .card-text {
    font-size: 1.6rem;
  }
  
  .game-info-item {
    padding: 6px 8px;
    gap: 6px;
  }
  
  .info-value {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .card-text {
    font-size: 1.3rem;
  }
  
  .card {
    min-width: 40px;
    min-height: 40px;
  }
  
  .grid-4x4 {
    gap: 8px;
    max-width: 350px;
  }
  
  .grid-5x4 {
    gap: 6px;
    max-width: 400px;
  }
  
  .info-label {
    font-size: 0.6rem;
  }
  
  .info-value {
    font-size: 0.9rem;
  }
}

/* === 性能优化 === */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .card:hover {
    transform: none !important;
  }
}
</style>