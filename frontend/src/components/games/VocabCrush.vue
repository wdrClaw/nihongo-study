<template>
  <div class="h-screen bg-gradient-to-b from-background-primary to-background-secondary flex flex-col overflow-hidden"
       @touchmove.prevent="onDragMove" @mousemove="onDragMove"
       @touchend="onDragEnd" @mouseup="onDragEnd">
    <!-- 顶部信息栏 -->
    <div class="bg-white/90 backdrop-blur-sm shadow-sm px-4 py-2 relative z-20">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="px-3 py-1.5 rounded-lg bg-gray-100 active:bg-gray-200 text-sm">← 返回</button>
        <div class="text-center">
          <div class="text-xs text-text-secondary">{{ stageTitle }}</div>
          <div class="text-xl font-bold" :class="timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-text-primary'">
            {{ formatTime(timeLeft) }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-text-secondary">得分</div>
          <div class="text-xl font-bold text-primary-400">{{ score }}</div>
        </div>
      </div>
      <!-- 进度 + 星级 -->
      <div class="flex items-center space-x-2 mt-1">
        <div class="flex space-x-0.5">
          <span v-for="i in 3" :key="i" class="text-sm" :class="i <= currentStars ? 'text-yellow-400' : 'text-gray-300'">★</span>
        </div>
        <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300"
               :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="text-xs text-text-secondary font-medium">{{ matchCount }}/{{ totalPairs }}</span>
      </div>
      <div v-if="combo > 1" class="text-center mt-0.5">
        <span class="text-xs font-bold text-accent-600 animate-bounce inline-block">🔥 {{ combo }}连击！</span>
      </div>
    </div>

    <!-- 游戏区域：上=日语 下=中文 -->
    <div class="flex-1 flex flex-col px-3 py-2 relative overflow-hidden" ref="gameArea">
      <!-- 上半区：日语 -->
      <div class="flex-1 flex flex-col">
        <div class="text-xs text-center text-text-light mb-1 font-medium">🇯🇵 日本語</div>
        <div class="flex-1 grid gap-1 content-center" :style="halfGridStyle" ref="topGridEl">
          <div v-for="(cell, index) in topGrid" :key="'t-' + cell.key"
               @touchstart.prevent="onDragStart($event, index, 'top')"
               @mousedown.prevent="onDragStart($event, index, 'top')"
               class="rounded-2xl flex flex-col items-center justify-center select-none transition-all duration-200 min-h-[56px]"
               :class="cellClass(index, cell, 'top')">
            <template v-if="!cell.empty">
              <div class="text-xl font-bold leading-none" :class="cell.side === 'jp' ? 'text-primary-600' : 'text-green-600'">
                {{ cell.display }}
              </div>
              <div v-if="cell.sub" class="text-[9px] mt-0.5 text-gray-400">{{ cell.sub }}</div>
            </template>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="flex items-center space-x-2 py-1">
        <div class="flex-1 h-[2px] bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
        <span class="text-xs text-primary-400 font-bold px-2">↕ 拖拽配对</span>
        <div class="flex-1 h-[2px] bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
      </div>

      <!-- 下半区：中文 -->
      <div class="flex-1 flex flex-col">
        <div class="text-xs text-center text-text-light mb-1 font-medium">🇨🇳 中文</div>
        <div class="flex-1 grid gap-1 content-center" :style="halfGridStyle" ref="bottomGridEl">
          <div v-for="(cell, index) in bottomGrid" :key="'b-' + cell.key"
               @touchstart.prevent="onDragStart($event, index, 'bottom')"
               @mousedown.prevent="onDragStart($event, index, 'bottom')"
               class="rounded-2xl flex flex-col items-center justify-center select-none transition-all duration-200 min-h-[56px]"
               :class="cellClass(index, cell, 'bottom')">
            <template v-if="!cell.empty">
              <div class="text-lg font-bold leading-none" :class="cell.side === 'cn' ? 'text-secondary-600' : 'text-primary-600'">
                {{ cell.display }}
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 拖拽幽灵 -->
      <div v-if="dragging" 
           class="fixed z-50 pointer-events-none rounded-2xl flex flex-col items-center justify-center shadow-2xl border-2 border-primary-400 bg-white/95"
           :style="ghostStyle">
        <div class="text-xl font-bold" :class="dragging.side === 'jp' ? 'text-primary-600' : 'text-secondary-600'">
          {{ dragging.display }}
        </div>
      </div>
    </div>

    <!-- 消除特效 -->
    <div v-for="effect in matchEffects" :key="effect.id"
         class="fixed z-40 pointer-events-none text-center animate-fade-up"
         :style="{ left: effect.x + 'px', top: effect.y + 'px' }">
      <div class="text-2xl font-bold text-accent-600">{{ effect.text }}</div>
    </div>

    <!-- 游戏结束弹窗 -->
    <div v-if="gameEnded" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div class="text-4xl mb-3">{{ isWin ? '🎉' : '⏰' }}</div>
        <h2 class="text-xl font-bold text-text-primary mb-2">{{ isWin ? '全部消除！' : '时间到！' }}</h2>
        <div class="flex justify-center space-x-2 mb-4">
          <span v-for="i in 3" :key="i" class="text-3xl" :class="i <= finalStars ? 'text-yellow-400' : 'text-gray-300'">★</span>
        </div>
        <div class="space-y-1 text-sm text-text-secondary mb-6">
          <p>得分: <span class="font-bold text-primary-400 text-lg">{{ score }}</span></p>
          <p>消除: <span class="font-bold">{{ matchCount }}/{{ totalPairs }}</span> 对</p>
          <p>用时: <span class="font-bold">{{ formatTime(elapsed) }}</span></p>
        </div>
        <div class="space-y-2">
          <button @click="restartGame" class="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-bold rounded-2xl">再来一局</button>
          <button @click="goBack" class="w-full py-2.5 bg-white text-text-primary font-medium rounded-xl border-2 border-gray-200">返回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
const props = defineProps({
  stageConfig: { type: Object, default: null }
})

const emit = defineEmits(['game-complete', 'game-exit'])
const router = useRouter()
const gameStore = useGameStore()

const COLS = 5
const HALF_ROWS = 3
const HALF_SIZE = COLS * HALF_ROWS

// 游戏数据
const vocabList = ref([])  // 从API获取的词汇
const totalPairs = computed(() => vocabList.value.length)
const totalTime = 600  // 10分钟

const topGrid = ref([])
const bottomGrid = ref([])
const poolTop = ref([])
const poolBottom = ref([])

const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const matchCount = ref(0)
const timeLeft = ref(totalTime)
const elapsed = ref(0)
const gameStarted = ref(false)
const gameEnded = ref(false)
const isWin = ref(false)
const finalStars = ref(0)
const timer = ref(null)
const topGridEl = ref(null)
const bottomGridEl = ref(null)
const gameArea = ref(null)
const matchEffects = ref([])
let cellKeyCounter = 0
let effectCounter = 0

const dragging = ref(null)
const dragFromIndex = ref(-1)
const dragFromZone = ref('')
const dragPos = ref({ x: 0, y: 0 })
const hoverIndex = ref(-1)
const hoverZone = ref('')

const stageTitle = computed(() => {
  if (props.stageConfig) return props.stageConfig.name_cn || props.stageConfig.title || '词汇消消乐'
  return '词汇消消乐'
})

const currentStars = computed(() => {
  if (matchCount.value >= totalPairs.value) return 3
  if (matchCount.value >= totalPairs.value * 0.7) return 2
  if (matchCount.value >= totalPairs.value * 0.4) return 1
  return 0
})

const progressPercent = computed(() => totalPairs.value > 0 ? (matchCount.value / totalPairs.value * 100) : 0)

const halfGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
  width: '100%',
  maxWidth: '420px',
  margin: '0 auto'
}))

const ghostStyle = computed(() => ({
  left: (dragPos.value.x - 36) + 'px',
  top: (dragPos.value.y - 36) + 'px',
  width: '72px',
  height: '72px'
}))

function emptyCell() {
  return { key: cellKeyCounter++, display: '', sub: '', side: '', pairId: '', removing: false, empty: true }
}

// 加载词汇数据
async function loadVocab() {
  try {
    const configData = props.stageConfig?.config_data || props.stageConfig?.game_data || {}
    const parsed = typeof configData === 'string' ? JSON.parse(configData) : configData
    const category = parsed.category || 'mixed'
    
    // 从后端API获取词汇
    const authStore = await import('@/stores/auth')
    const baseURL = `http://${window.location.hostname}:3002/api`
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${baseURL}/vocab/${category}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    
    if (data.success && data.words) {
      vocabList.value = data.words
    } else {
      // 备用：硬编码一些测试数据
      vocabList.value = [
        { japanese: '猫', reading: 'ねこ', chinese: '猫', romaji: 'neko' },
        { japanese: '犬', reading: 'いぬ', chinese: '狗', romaji: 'inu' },
        { japanese: '水', reading: 'みず', chinese: '水', romaji: 'mizu' },
      ]
    }
  } catch (e) {
    console.error('加载词汇失败:', e)
    vocabList.value = []
  }
}

// 初始化
function initGame() {
  cellKeyCounter = 0
  const words = [...vocabList.value]
  shuffleArr(words)
  
  const onGridCount = Math.min(HALF_SIZE, words.length)
  const onGrid = words.slice(0, onGridCount)
  const inPool = words.slice(onGridCount)
  
  const topCells = []
  const bottomCells = []
  
  onGrid.forEach((w, i) => {
    // 上面：日语
    topCells.push({
      key: cellKeyCounter++,
      display: w.japanese,
      sub: w.reading !== w.japanese ? w.reading : '',
      side: 'jp',
      pairId: String(i),
      removing: false,
      empty: false,
      speakText: w.reading || w.japanese
    })
    // 下面：中文
    bottomCells.push({
      key: cellKeyCounter++,
      display: w.chinese,
      sub: '',
      side: 'cn',
      pairId: String(i),
      removing: false,
      empty: false,
      speakText: w.reading || w.japanese
    })
  })
  
  while (topCells.length < HALF_SIZE) topCells.push(emptyCell())
  while (bottomCells.length < HALF_SIZE) bottomCells.push(emptyCell())
  shuffleArr(topCells)
  shuffleArr(bottomCells)
  topGrid.value = topCells
  bottomGrid.value = bottomCells
  
  // 池子（独立打乱）
  const pTopArr = []
  const pBottomArr = []
  inPool.forEach((w, i) => {
    const pid = String(onGridCount + i)
    pTopArr.push({
      key: cellKeyCounter++, display: w.japanese, sub: w.reading !== w.japanese ? w.reading : '',
      side: 'jp', pairId: pid, removing: false, empty: false, speakText: w.reading || w.japanese
    })
    pBottomArr.push({
      key: cellKeyCounter++, display: w.chinese, sub: '',
      side: 'cn', pairId: pid, removing: false, empty: false, speakText: w.reading || w.japanese
    })
  })
  shuffleArr(pTopArr)
  shuffleArr(pBottomArr)
  poolTop.value = pTopArr
  poolBottom.value = pBottomArr
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

// 格子样式
function cellClass(index, cell, zone) {
  if (cell.empty) return 'bg-gray-50 border border-dashed border-gray-200 opacity-40'
  if (cell.removing) return 'bg-accent-500/20 scale-0 opacity-0 transition-all duration-300'
  if (index === dragFromIndex.value && zone === dragFromZone.value) return 'opacity-30 bg-gray-100 border border-dashed border-gray-300'
  if (index === hoverIndex.value && zone === hoverZone.value && dragging.value && !cell.empty) {
    const canMatch = dragging.value.pairId === cell.pairId && dragging.value.side !== cell.side
    return canMatch
      ? 'bg-green-100 border-2 border-green-400 scale-110 shadow-lg ring-4 ring-green-200'
      : 'bg-red-50 border-2 border-red-300 scale-105'
  }
  if (cell.side === 'jp') return 'bg-white border border-primary-100 shadow-sm'
  if (cell.side === 'cn') return 'bg-white border border-secondary-100 shadow-sm'
  return 'bg-white border border-gray-100 shadow-sm'
}

// 拖拽（只能从上面拖日语）
function onDragStart(e, index, zone) {
  if (!gameStarted.value || gameEnded.value) return
  if (zone !== 'top') return
  const cell = topGrid.value[index]
  if (cell.empty || cell.removing) return
  dragging.value = { ...cell }
  dragFromIndex.value = index
  dragFromZone.value = zone
  dragPos.value = getEventPos(e)
  speakWord(cell)
}

function onDragMove(e) {
  if (!dragging.value) return
  dragPos.value = getEventPos(e)
  const hit = getIndexAtPos(dragPos.value.x, dragPos.value.y)
  hoverIndex.value = hit.index
  hoverZone.value = hit.zone
}

function onDragEnd() {
  if (!dragging.value) return
  if (hoverIndex.value >= 0 && hoverZone.value &&
      !(hoverIndex.value === dragFromIndex.value && hoverZone.value === dragFromZone.value)) {
    const targetGrid = hoverZone.value === 'top' ? topGrid.value : bottomGrid.value
    const targetCell = targetGrid[hoverIndex.value]
    if (!targetCell.empty && dragging.value.pairId === targetCell.pairId && dragging.value.side !== targetCell.side) {
      eliminatePair(dragFromIndex.value, dragFromZone.value, hoverIndex.value, hoverZone.value)
    }
  }
  dragging.value = null
  dragFromIndex.value = -1
  dragFromZone.value = ''
  hoverIndex.value = -1
  hoverZone.value = ''
}

async function eliminatePair(fromIdx, fromZone, toIdx, toZone) {
  const fromGrid = fromZone === 'top' ? topGrid : bottomGrid
  const toGrid = toZone === 'top' ? topGrid : bottomGrid
  fromGrid.value[fromIdx].removing = true
  toGrid.value[toIdx].removing = true
  
  combo.value++
  if (combo.value > maxCombo.value) maxCombo.value = combo.value
  matchCount.value++
  const points = 100 + Math.min(combo.value - 1, 10) * 30
  score.value += points
  
  showMatchEffect(toIdx, toZone, `+${points}`)
  speakWord(fromGrid.value[fromIdx])
  resetComboTimer()
  
  await sleep(400)
  
  fromGrid.value[fromIdx] = emptyCell()
  toGrid.value[toIdx] = emptyCell()
  
  const topEmpties = []
  const bottomEmpties = []
  topGrid.value.forEach((c, i) => { if (c.empty) topEmpties.push(i) })
  bottomGrid.value.forEach((c, i) => { if (c.empty) bottomEmpties.push(i) })
  
  if (poolTop.value.length > 0 && topEmpties.length > 0) {
    const ti = topEmpties[Math.floor(Math.random() * topEmpties.length)]
    topGrid.value[ti] = poolTop.value.pop()
  }
  if (poolBottom.value.length > 0 && bottomEmpties.length > 0) {
    const bi = bottomEmpties[Math.floor(Math.random() * bottomEmpties.length)]
    bottomGrid.value[bi] = poolBottom.value.pop()
  }
  
  if (matchCount.value >= totalPairs.value) {
    isWin.value = true
    endGame()
  }
}

let comboTimer = null
function resetComboTimer() {
  if (comboTimer) clearTimeout(comboTimer)
  comboTimer = setTimeout(() => { combo.value = 0 }, 3000)
}

function showMatchEffect(index, zone, text) {
  const el = zone === 'top' ? topGridEl.value : bottomGridEl.value
  if (!el) return
  const cells = el.children
  if (!cells[index]) return
  const rect = cells[index].getBoundingClientRect()
  const effect = { id: effectCounter++, text, x: rect.left + rect.width / 2 - 20, y: rect.top - 10 }
  matchEffects.value.push(effect)
  setTimeout(() => { matchEffects.value = matchEffects.value.filter(e => e.id !== effect.id) }, 800)
}

function getIndexAtPos(x, y) {
  if (topGridEl.value) {
    const children = topGridEl.value.children
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return { index: i, zone: 'top' }
    }
  }
  if (bottomGridEl.value) {
    const children = bottomGridEl.value.children
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return { index: i, zone: 'bottom' }
    }
  }
  return { index: -1, zone: '' }
}

function getEventPos(e) {
  if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
  return { x: e.clientX, y: e.clientY }
}

// 游戏控制
async function startGame() {
  await loadVocab()
  if (vocabList.value.length === 0) return
  
  gameStarted.value = true
  gameEnded.value = false
  isWin.value = false
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  matchCount.value = 0
  timeLeft.value = totalTime
  elapsed.value = 0
  initGame()
  
  if (timer.value) { clearInterval(timer.value); timer.value = null }
  timer.value = setInterval(() => {
    timeLeft.value--
    elapsed.value++
    if (timeLeft.value <= 0) { isWin.value = false; endGame() }
  }, 1000)
}

async function endGame() {
  gameEnded.value = true
  gameStarted.value = false
  
  const total = totalPairs.value
  const tl = totalTime
  if (isWin.value) {
    if (timeLeft.value > tl * 0.6) finalStars.value = 3
    else if (timeLeft.value > tl * 0.2) finalStars.value = 2
    else finalStars.value = 1
  } else {
    if (matchCount.value >= total * 0.7) finalStars.value = 2
    else if (matchCount.value >= total * 0.4) finalStars.value = 1
    else finalStars.value = 0
  }
  
  if (timer.value) { clearInterval(timer.value); timer.value = null }
  
  // 提交
  if (props.stageConfig?.stage_id && props.stageConfig?.area_id) {
    try {
      await gameStore.submitStageResult(props.stageConfig.area_id, props.stageConfig.stage_id, {
        score: score.value, stars: finalStars.value, result: isWin.value ? 'win' : 'lose'
      })
    } catch (e) { console.error('提交失败:', e) }
  }
  
  emit('game-complete', { result: isWin.value ? 'win' : 'lose', score: score.value, stars: finalStars.value })
}

function restartGame() { gameEnded.value = false; startGame() }

function goBack() {
  if (timer.value) clearInterval(timer.value)
  emit('game-exit')
  router.back()
}

function formatTime(s) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}` }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function speakWord(cell) {
  if (!cell || cell.empty || !('speechSynthesis' in window)) return
  const text = cell.speakText || cell.display
  if (!text) return
  speechSynthesis.cancel()
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    u.rate = 0.8
    u.volume = 0.8
    speechSynthesis.speak(u)
  }, 50)
}

onMounted(() => { startGame() })

onBeforeUnmount(() => {
  if (timer.value) { clearInterval(timer.value); timer.value = null }
  if (comboTimer) { clearTimeout(comboTimer); comboTimer = null }
})
</script>

<style scoped>
.animate-fade-up { animation: fadeUp 0.8s ease-out forwards; }
@keyframes fadeUp {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
}
</style>
