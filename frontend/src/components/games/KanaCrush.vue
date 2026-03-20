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
        <span class="text-xs text-text-secondary font-medium">{{ matchCount }}/{{ kanaPairs.length }}</span>
      </div>
      <div v-if="combo > 1" class="text-center mt-0.5">
        <span class="text-xs font-bold text-accent-600 animate-bounce inline-block">🔥 {{ combo }}连击！</span>
      </div>
    </div>

    <!-- 游戏区域：上下两块撑满 -->
    <div class="flex-1 flex flex-col px-3 py-2 relative overflow-hidden" ref="gameArea">
      
      <!-- 上半区 -->
      <div class="flex-1 flex flex-col">
        <div class="text-xs text-center text-text-light mb-1 font-medium">{{ topLabel }}</div>
        <div class="flex-1 grid gap-1 content-center" :style="halfGridStyle" ref="topGridEl">
          <div v-for="(cell, index) in topGrid" :key="'t-' + cell.key"
               @touchstart.prevent="onDragStart($event, index, 'top')"
               @mousedown.prevent="onDragStart($event, index, 'top')"
               class="rounded-2xl flex flex-col items-center justify-center select-none transition-all duration-200 min-h-[60px]"
               :class="cellClass(index, cell, 'top')"
               :data-zone="'top'" :data-index="index">
            <template v-if="!cell.empty">
              <div class="text-3xl font-bold leading-none" :class="cellTextClass(cell)">{{ cell.display }}</div>
              <div v-if="cell.hint" class="text-[10px] mt-1" :class="cellHintClass(cell)">{{ cell.hint }}</div>
            </template>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="flex items-center space-x-2 py-2">
        <div class="flex-1 h-[2px] bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
        <span class="text-xs text-primary-400 font-bold px-2">↕ 拖拽配对</span>
        <div class="flex-1 h-[2px] bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
      </div>

      <!-- 下半区 -->
      <div class="flex-1 flex flex-col">
        <div class="text-xs text-center text-text-light mb-1 font-medium">{{ bottomLabel }}</div>
        <div class="flex-1 grid gap-1 content-center" :style="halfGridStyle" ref="bottomGridEl">
          <div v-for="(cell, index) in bottomGrid" :key="'b-' + cell.key"
               @touchstart.prevent="onDragStart($event, index, 'bottom')"
               @mousedown.prevent="onDragStart($event, index, 'bottom')"
               class="rounded-2xl flex flex-col items-center justify-center select-none transition-all duration-200 min-h-[60px]"
               :class="cellClass(index, cell, 'bottom')"
               :data-zone="'bottom'" :data-index="index">
            <template v-if="!cell.empty">
              <div class="text-3xl font-bold leading-none" :class="cellTextClass(cell)">{{ cell.display }}</div>
              <div v-if="cell.hint" class="text-[10px] mt-1" :class="cellHintClass(cell)">{{ cell.hint }}</div>
            </template>
          </div>
        </div>
      </div>

      <!-- 拖拽幽灵 -->
      <div v-if="dragging" 
           class="fixed z-50 pointer-events-none rounded-2xl flex flex-col items-center justify-center shadow-2xl border-2 border-primary-400 bg-white/95"
           :style="ghostStyle">
        <div class="text-3xl font-bold" :class="cellTextClass(dragging)">{{ dragging.display }}</div>
      </div>
    </div>

    <!-- 消除特效 -->
    <div v-for="effect in matchEffects" :key="effect.id"
         class="fixed z-40 pointer-events-none text-center animate-fade-up"
         :style="{ left: effect.x + 'px', top: effect.y + 'px' }">
      <div class="text-2xl font-bold text-accent-600">{{ effect.text }}</div>
    </div>

    <!-- 底部（游戏中隐藏，省空间） -->
    <div v-if="!gameStarted" class="px-4 pb-4 pt-1 text-center relative z-10">
      <p class="text-sm text-text-secondary mb-2">{{ modeDescription }}</p>
      <button @click="startGame" class="w-full py-3 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
        开始游戏
      </button>
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
          <p>消除: <span class="font-bold">{{ matchCount }}/{{ kanaPairs.length }}</span> 对</p>
          <p>用时: <span class="font-bold">{{ formatTime(elapsed) }}</span></p>
          <p>最高连击: <span class="font-bold text-accent-600">{{ maxCombo }}</span></p>
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
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const props = defineProps({
  // 从 GamePlay 传入的关卡配置
  stageConfig: { type: Object, default: null },
  // 独立路由用
  config: { type: Object, default: null },
  stageId: { type: [String, Number], default: null },
  onComplete: { type: Function, default: null }
})

const emit = defineEmits(['complete', 'game-complete', 'game-exit'])
const router = useRouter()
const gameStore = useGameStore()

// ============ 假名数据 ============
const SEION = [  // 清音 46
  { h: 'あ', k: 'ア', r: 'a' }, { h: 'い', k: 'イ', r: 'i' }, { h: 'う', k: 'ウ', r: 'u' },
  { h: 'え', k: 'エ', r: 'e' }, { h: 'お', k: 'オ', r: 'o' },
  { h: 'か', k: 'カ', r: 'ka' }, { h: 'き', k: 'キ', r: 'ki' }, { h: 'く', k: 'ク', r: 'ku' },
  { h: 'け', k: 'ケ', r: 'ke' }, { h: 'こ', k: 'コ', r: 'ko' },
  { h: 'さ', k: 'サ', r: 'sa' }, { h: 'し', k: 'シ', r: 'shi' }, { h: 'す', k: 'ス', r: 'su' },
  { h: 'せ', k: 'セ', r: 'se' }, { h: 'そ', k: 'ソ', r: 'so' },
  { h: 'た', k: 'タ', r: 'ta' }, { h: 'ち', k: 'チ', r: 'chi' }, { h: 'つ', k: 'ツ', r: 'tsu' },
  { h: 'て', k: 'テ', r: 'te' }, { h: 'と', k: 'ト', r: 'to' },
  { h: 'な', k: 'ナ', r: 'na' }, { h: 'に', k: 'ニ', r: 'ni' }, { h: 'ぬ', k: 'ヌ', r: 'nu' },
  { h: 'ね', k: 'ネ', r: 'ne' }, { h: 'の', k: 'ノ', r: 'no' },
  { h: 'は', k: 'ハ', r: 'ha' }, { h: 'ひ', k: 'ヒ', r: 'hi' }, { h: 'ふ', k: 'フ', r: 'fu' },
  { h: 'へ', k: 'ヘ', r: 'he' }, { h: 'ほ', k: 'ホ', r: 'ho' },
  { h: 'ま', k: 'マ', r: 'ma' }, { h: 'み', k: 'ミ', r: 'mi' }, { h: 'む', k: 'ム', r: 'mu' },
  { h: 'め', k: 'メ', r: 'me' }, { h: 'も', k: 'モ', r: 'mo' },
  { h: 'や', k: 'ヤ', r: 'ya' }, { h: 'ゆ', k: 'ユ', r: 'yu' }, { h: 'よ', k: 'ヨ', r: 'yo' },
  { h: 'ら', k: 'ラ', r: 'ra' }, { h: 'り', k: 'リ', r: 'ri' }, { h: 'る', k: 'ル', r: 'ru' },
  { h: 'れ', k: 'レ', r: 're' }, { h: 'ろ', k: 'ロ', r: 'ro' },
  { h: 'わ', k: 'ワ', r: 'wa' }, { h: 'を', k: 'ヲ', r: 'wo' }, { h: 'ん', k: 'ン', r: 'n' },
]

const DAKUON = [  // 浊音+半浊音 25
  { h: 'が', k: 'ガ', r: 'ga' }, { h: 'ぎ', k: 'ギ', r: 'gi' }, { h: 'ぐ', k: 'グ', r: 'gu' },
  { h: 'げ', k: 'ゲ', r: 'ge' }, { h: 'ご', k: 'ゴ', r: 'go' },
  { h: 'ざ', k: 'ザ', r: 'za' }, { h: 'じ', k: 'ジ', r: 'ji' }, { h: 'ず', k: 'ズ', r: 'zu' },
  { h: 'ぜ', k: 'ゼ', r: 'ze' }, { h: 'ぞ', k: 'ゾ', r: 'zo' },
  { h: 'だ', k: 'ダ', r: 'da' }, { h: 'ぢ', k: 'ヂ', r: 'di' }, { h: 'づ', k: 'ヅ', r: 'du' },
  { h: 'で', k: 'デ', r: 'de' }, { h: 'ど', k: 'ド', r: 'do' },
  { h: 'ば', k: 'バ', r: 'ba' }, { h: 'び', k: 'ビ', r: 'bi' }, { h: 'ぶ', k: 'ブ', r: 'bu' },
  { h: 'べ', k: 'ベ', r: 'be' }, { h: 'ぼ', k: 'ボ', r: 'bo' },
  { h: 'ぱ', k: 'パ', r: 'pa' }, { h: 'ぴ', k: 'ピ', r: 'pi' }, { h: 'ぷ', k: 'プ', r: 'pu' },
  { h: 'ぺ', k: 'ペ', r: 'pe' }, { h: 'ぽ', k: 'ポ', r: 'po' },
]

// ============ 关卡配置 ============
// mode: 'h2r' = 平假名↔罗马音, 'k2r' = 片假名↔罗马音, 'h2k' = 平假名↔片假名, 'mix2r' = 混合↔罗马音
const STAGE_PRESETS = {
  1: { title: '平假名入門', mode: 'h2r', kana: SEION.slice(0, 25), time: 300, desc: '拖拽平假名到对应罗马音消除 (あ~の)' },
  2: { title: '平假名進階', mode: 'h2r', kana: SEION.slice(25), time: 300, desc: '拖拽平假名到对应罗马音消除 (は~ん)' },
  3: { title: '片假名入門', mode: 'k2r', kana: SEION.slice(0, 25), time: 300, desc: '拖拽片假名到对应罗马音消除 (ア~ノ)' },
  4: { title: '片假名進階', mode: 'k2r', kana: SEION.slice(25), time: 300, desc: '拖拽片假名到对应罗马音消除 (ハ~ン)' },
  5: { title: '濁音挑戰', mode: 'h2r', kana: DAKUON, time: 360, desc: '拖拽浊音/半浊音到对应罗马音消除' },
  6: { title: '混合亂鬥', mode: 'mix2r', kana: SEION, time: 600, desc: '平假名和片假名混合出现，配对罗马音！' },
  7: { title: '終極試煉', mode: 'h2k', kana: SEION, time: 900, desc: '平假名配片假名，消除全部46对！' },
}

// 解析配置：从 GamePlay 的 stageConfig 或直接传入
const crushConfig = computed(() => {
  // 从 GamePlay 传入
  if (props.stageConfig) {
    const configData = props.stageConfig.config_data || props.stageConfig.game_data || props.stageConfig.configData || {}
    const parsed = typeof configData === 'string' ? JSON.parse(configData) : configData
    const crushStage = parsed.crush_stage || parsed.crushStage
    if (crushStage && STAGE_PRESETS[crushStage]) return STAGE_PRESETS[crushStage]
  }
  // 直接传 config
  if (props.config && props.config.mode) return props.config
  // stageId 预设
  if (props.stageId && STAGE_PRESETS[props.stageId]) return STAGE_PRESETS[props.stageId]
  // 默认第7关
  return STAGE_PRESETS[7]
})

const stageTitle = computed(() => crushConfig.value.title || '五十音消消乐')
const modeDescription = computed(() => crushConfig.value.desc || '拖拽配对消除！')
const totalTime = computed(() => crushConfig.value.time || 900)

// 根据 mode 生成配对
const kanaPairs = computed(() => {
  const cfg = crushConfig.value
  const kanaList = cfg.kana || SEION
  return kanaList.map(k => ({ ...k }))
})

// 根据 mode 生成两个格子（一对）
function makePairCells(pair, mode) {
  const m = mode || crushConfig.value.mode || 'h2k'
  let cellA, cellB
  
  if (m === 'h2r') {
    // 平假名 ↔ 罗马音
    cellA = { display: pair.h, type: 'hiragana', hint: '', pairId: pair.r, speakText: pair.h }
    cellB = { display: pair.r, type: 'romaji', hint: '', pairId: pair.r, speakText: pair.h }
  } else if (m === 'k2r') {
    // 片假名 ↔ 罗马音
    cellA = { display: pair.k, type: 'katakana', hint: '', pairId: pair.r, speakText: pair.h }
    cellB = { display: pair.r, type: 'romaji', hint: '', pairId: pair.r, speakText: pair.h }
  } else if (m === 'mix2r') {
    // 随机平假名或片假名 ↔ 罗马音
    const useH = Math.random() > 0.5
    cellA = { display: useH ? pair.h : pair.k, type: useH ? 'hiragana' : 'katakana', hint: '', pairId: pair.r, speakText: pair.h }
    cellB = { display: pair.r, type: 'romaji', hint: '', pairId: pair.r, speakText: pair.h }
  } else {
    // h2k: 平假名 ↔ 片假名
    cellA = { display: pair.h, type: 'hiragana', hint: pair.r, pairId: pair.r, speakText: pair.h }
    cellB = { display: pair.k, type: 'katakana', hint: pair.r, pairId: pair.r, speakText: pair.h }
  }
  
  return [
    { ...cellA, key: cellKeyCounter++, removing: false, empty: false },
    { ...cellB, key: cellKeyCounter++, removing: false, empty: false }
  ]
}

// ============ 游戏状态 ============
const COLS = 5
const HALF_ROWS = 3  // 每半区3行
const HALF_SIZE = COLS * HALF_ROWS  // 15格

const topGrid = ref([])      // 上半区（罗马音/片假名）
const bottomGrid = ref([])   // 下半区（假名）
const poolTop = ref([])      // 池子：上半区待补
const poolBottom = ref([])   // 池子：下半区待补

const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const matchCount = ref(0)
const timeLeft = ref(0)
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

const currentStars = computed(() => {
  const total = kanaPairs.value.length
  if (matchCount.value >= total) return 3
  if (matchCount.value >= total * 0.7) return 2
  if (matchCount.value >= total * 0.4) return 1
  return 0
})

const progressPercent = computed(() => (matchCount.value / kanaPairs.value.length * 100))
const poolRemaining = computed(() => Math.max(poolTop.value.length, poolBottom.value.length))

const halfGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
  width: '100%',
  maxWidth: '420px',
  margin: '0 auto'
}))

// 上半区标签
const topLabel = computed(() => {
  const m = crushConfig.value.mode
  if (m === 'h2r' || m === 'k2r' || m === 'mix2r') return '🔤 罗马音'
  if (m === 'h2k') return '🗾 片假名'
  return '🔤'
})

const bottomLabel = computed(() => {
  const m = crushConfig.value.mode
  if (m === 'h2r') return '🇯🇵 平假名'
  if (m === 'k2r') return '🇯🇵 片假名'
  if (m === 'mix2r') return '🇯🇵 假名'
  if (m === 'h2k') return '🇯🇵 平假名'
  return '🇯🇵'
})

const ghostStyle = computed(() => ({
  left: (dragPos.value.x - 36) + 'px',
  top: (dragPos.value.y - 36) + 'px',
  width: '72px',
  height: '72px'
}))

// 文字颜色
function cellTextClass(cell) {
  if (cell.type === 'hiragana') return 'text-primary-600'
  if (cell.type === 'katakana') return 'text-secondary-600'
  if (cell.type === 'romaji') return 'text-green-600'
  return 'text-text-primary'
}

function cellHintClass(cell) {
  if (cell.type === 'hiragana') return 'text-primary-400'
  if (cell.type === 'katakana') return 'text-secondary-400'
  return 'text-gray-400'
}

function emptyCell() {
  return { key: cellKeyCounter++, display: '', type: '', hint: '', pairId: '', removing: false, empty: true, speakText: '' }
}

// 初始化：上半区放A类格子（罗马音/片假名），下半区放B类格子（假名）
function initGame() {
  cellKeyCounter = 0
  const pairs = [...kanaPairs.value]
  shuffleArr(pairs)
  
  const onGridCount = Math.min(HALF_SIZE, pairs.length)  // 上场15对（或更少）
  const onGrid = pairs.slice(0, onGridCount)
  const inPool = pairs.slice(onGridCount)
  
  const mode = crushConfig.value.mode
  const topCells = []
  const bottomCells = []
  
  onGrid.forEach(pair => {
    const [a, b] = makePairCells(pair, mode)
    // a 是上半区（罗马音/片假名），b 是下半区（假名）— 但 makePairCells 顺序需要看 mode
    // 对于 h2r/k2r/mix2r: a=假名, b=罗马音 → 上=b(罗马音), 下=a(假名)
    // 对于 h2k: a=平假名, b=片假名 → 上=b(片假名), 下=a(平假名)
    topCells.push(b)
    bottomCells.push(a)
  })
  
  while (topCells.length < HALF_SIZE) topCells.push(emptyCell())
  while (bottomCells.length < HALF_SIZE) bottomCells.push(emptyCell())
  shuffleArr(topCells)
  shuffleArr(bottomCells)
  topGrid.value = topCells
  bottomGrid.value = bottomCells
  
  // 池子：上下分开存，各自独立打乱（不成对出现）
  const poolTopArr = []
  const poolBottomArr = []
  inPool.forEach(pair => {
    const [a, b] = makePairCells(pair, mode)
    poolTopArr.push(b)     // 罗马音/片假名
    poolBottomArr.push(a)  // 假名
  })
  shuffleArr(poolTopArr)
  shuffleArr(poolBottomArr)
  poolTop.value = poolTopArr
  poolBottom.value = poolBottomArr
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
    const canMatch = dragging.value.pairId === cell.pairId && dragging.value.type !== cell.type
    return canMatch
      ? 'bg-green-100 border-2 border-green-400 scale-110 shadow-lg ring-4 ring-green-200'
      : 'bg-red-50 border-2 border-red-300 scale-105'
  }
  if (cell.type === 'romaji') return 'bg-green-50 border border-green-200 shadow-sm'
  if (cell.type === 'hiragana') return 'bg-white border border-primary-100 shadow-sm'
  if (cell.type === 'katakana') return 'bg-white border border-secondary-100 shadow-sm'
  return 'bg-white border border-gray-100 shadow-sm'
}

// 拖拽（只允许拖上半区：罗马音/片假名）
function onDragStart(e, index, zone) {
  if (!gameStarted.value || gameEnded.value) return
  if (zone !== 'top') return  // 只能拖上面的
  const grid = topGrid.value
  const cell = grid[index]
  if (cell.empty || cell.removing) return
  dragging.value = { ...cell }
  dragFromIndex.value = index
  dragFromZone.value = zone
  dragPos.value = getEventPos(e)
  speakKana(cell)
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
    
    if (!targetCell.empty && dragging.value.pairId === targetCell.pairId && dragging.value.type !== targetCell.type) {
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
  
  const comboBonus = Math.min(combo.value - 1, 10) * 30
  const points = 100 + comboBonus
  score.value += points
  
  showMatchEffect(toIdx, toZone, `+${points}`)
  speakKana(fromGrid.value[fromIdx])
  resetComboTimer()
  
  await sleep(400)
  
  // 从池子补充：上下独立补，不成对
  fromGrid.value[fromIdx] = emptyCell()
  toGrid.value[toIdx] = emptyCell()
  
  // 收集空位
  const topEmpties = []
  const bottomEmpties = []
  topGrid.value.forEach((c, i) => { if (c.empty) topEmpties.push(i) })
  bottomGrid.value.forEach((c, i) => { if (c.empty) bottomEmpties.push(i) })
  
  // 上半区补一个
  if (poolTop.value.length > 0 && topEmpties.length > 0) {
    const ti = topEmpties[Math.floor(Math.random() * topEmpties.length)]
    topGrid.value[ti] = poolTop.value.pop()
  }
  // 下半区补一个
  if (poolBottom.value.length > 0 && bottomEmpties.length > 0) {
    const bi = bottomEmpties[Math.floor(Math.random() * bottomEmpties.length)]
    bottomGrid.value[bi] = poolBottom.value.pop()
  }
  
  if (matchCount.value >= kanaPairs.value.length) {
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
  // 检查上半区
  if (topGridEl.value) {
    const children = topGridEl.value.children
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return { index: i, zone: 'top' }
    }
  }
  // 检查下半区
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
function startGame() {
  gameStarted.value = true
  gameEnded.value = false
  isWin.value = false
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  matchCount.value = 0
  timeLeft.value = totalTime.value
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
  
  const total = kanaPairs.value.length
  const tl = totalTime.value
  if (isWin.value) {
    // 全消完：按剩余时间比例给星
    if (timeLeft.value > tl * 0.6) finalStars.value = 3
    else if (timeLeft.value > tl * 0.2) finalStars.value = 2
    else finalStars.value = 1
  } else {
    if (matchCount.value >= total * 0.7) finalStars.value = 2
    else if (matchCount.value >= total * 0.4) finalStars.value = 1
    else finalStars.value = 0
  }
  
  if (timer.value) { clearInterval(timer.value); timer.value = null }
  
  // 提交结果到后端
  if (props.stageConfig && props.stageConfig.stage_id && props.stageConfig.area_id) {
    try {
      await gameStore.submitStageResult(
        props.stageConfig.area_id,
        props.stageConfig.stage_id,
        {
          score: score.value,
          stars: finalStars.value,
          result: isWin.value ? 'win' : 'lose'
        }
      )
    } catch (e) {
      console.error('提交结果失败:', e)
    }
  }
  
  // 通知父组件（兼容 GamePlay 的 game-complete 事件）
  const result = { 
    stars: finalStars.value, 
    score: score.value, 
    matchCount: matchCount.value, 
    total, 
    elapsed: elapsed.value, 
    isWin: isWin.value,
    // GamePlay 需要的字段
    result: isWin.value ? 'win' : 'lose'
  }
  emit('complete', result)
  emit('game-complete', result)
  if (props.onComplete) props.onComplete(result)
}

function restartGame() { gameEnded.value = false; startGame() }

function goBack() {
  if (timer.value) clearInterval(timer.value)
  emit('game-exit')
  if (props.stageConfig) {
    router.back()
  } else if (props.stageId) {
    router.back()
  } else {
    router.push('/game/map')
  }
}

function formatTime(s) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}` }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function speakKana(cell) {
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

onMounted(() => {
  startGame()
})

onBeforeUnmount(() => {
  if (timer.value) { clearInterval(timer.value); timer.value = null }
  if (comboTimer) { clearTimeout(comboTimer); comboTimer = null }
})

onUnmounted(() => {
  if (timer.value) { clearInterval(timer.value); timer.value = null }
})
</script>

<style scoped>
.animate-fade-up { animation: fadeUp 0.8s ease-out forwards; }
@keyframes fadeUp {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
}
</style>
