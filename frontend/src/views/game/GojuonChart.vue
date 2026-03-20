<template>
  <div class="min-h-screen bg-gradient-to-b from-background-primary to-background-secondary">
    <!-- 顶部导航 -->
    <div class="sticky top-0 z-20 bg-white/90 backdrop-blur-sm shadow-sm">
      <div class="flex items-center justify-between px-4 h-[50px]">
        <button @click="goBack" class="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 active:bg-gray-200">
          <span>←</span>
          <span class="text-sm">返回</span>
        </button>
        <h1 class="text-lg font-bold text-text-primary">📖 五十音図</h1>
        <div class="flex items-center space-x-2">
          <!-- 儿歌 -->
          <button @click="toggleBgm"
                  class="px-2 py-1 rounded-full text-xs font-bold transition-all"
                  :class="bgmPlaying ? 'bg-red-100 text-red-500' : 'bg-accent-50 text-accent-600'">
            {{ bgmPlaying ? '⏸' : '🎵' }}
          </button>
          <!-- 朗读 -->
          <button @click="toggleAutoPlay"
                  class="px-2 py-1 rounded-full text-xs font-bold transition-all"
                  :class="autoPlaying ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-primary-50 text-primary-500'">
            {{ autoPlaying ? '⏸' : '▶' }}
          </button>
          <!-- 视频 -->
          <button @click="showVideo = !showVideo"
                  class="px-2 py-1 rounded-full text-xs font-bold transition-all"
                  :class="showVideo ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-500'">
            {{ showVideo ? '✕' : '🎬' }}
          </button>
          <!-- 语速 -->
          <button @click="toggleSpeed"
                  class="px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
            {{ speedIcon }}
          </button>
        </div>
      </div>

      <!-- 分类 Tab -->
      <div class="px-3 pb-2 overflow-x-auto">
        <div class="flex space-x-2 min-w-max">
          <button v-for="tab in tabs" :key="tab.id"
                  @click="currentTab = tab.id"
                  class="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all"
                  :class="currentTab === tab.id
                    ? 'bg-primary-400 text-white shadow-md'
                    : 'bg-white text-text-secondary border border-gray-200'">
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 视频播放器 -->
    <div v-if="showVideo" class="px-3 py-2">
      <div class="bg-black rounded-2xl overflow-hidden shadow-lg">
        <video ref="videoEl" controls playsinline
               class="w-full aspect-video"
               src="/sounds/gojuon-song.mp4"
               poster="/icons/icon-192.png">
        </video>
        <div class="bg-gray-900 px-3 py-2 flex items-center justify-between">
          <span class="text-white/70 text-xs">🎵 あいうえおのうた — 五十音儿歌</span>
          <button @click="showVideo = false" class="text-white/50 text-xs hover:text-white">收起</button>
        </div>
      </div>
    </div>

    <!-- 假名表格 -->
    <div class="px-2 pb-20">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="w-8"></th>
            <th v-for="vowel in currentVowels" :key="vowel"
                class="text-center py-2 text-xs font-bold text-secondary-500">
              {{ vowel }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in currentRows" :key="ri"
              :class="ri % 2 === 0 ? 'bg-white/60' : 'bg-primary-50/30'">
            <td class="text-center py-1 text-xs font-bold text-primary-400 align-middle">{{ row.label }}</td>
            <td v-for="(kana, ci) in row.kanas" :key="ci" class="text-center p-0.5">
              <button v-if="kana"
                      @click="speakKana(kana)"
                      class="w-full rounded-xl p-1.5 transition-all duration-200 active:scale-95 border border-gray-100"
                      :class="playingKana === kana.id ? 'bg-primary-400 shadow-lg scale-105' : 'bg-white shadow-sm'">
                <!-- 主假名 -->
                <div class="text-lg font-bold leading-tight"
                     :class="playingKana === kana.id ? 'text-white' : 'text-text-primary'">
                  {{ displayMain(kana) }}
                </div>
                <!-- 副假名（对照模式显示另一种） -->
                <div v-if="showBoth" class="text-[10px] leading-tight"
                     :class="playingKana === kana.id ? 'text-white/70' : 'text-text-light'">
                  {{ displaySub(kana) }}
                </div>
                <!-- 罗马音 -->
                <div class="text-[9px] font-medium leading-tight mt-0.5"
                     :class="playingKana === kana.id ? 'text-white/80' : 'text-secondary-500'">
                  {{ kana.romaji }}
                </div>
              </button>
              <div v-else class="w-full h-14"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Tab 定义
const tabs = [
  { id: 'hiragana', label: '平假名' },
  { id: 'katakana', label: '片假名' },
  { id: 'both', label: '平片对照' },
  { id: 'dakuon', label: '浊音' },
  { id: 'handakuon', label: '半浊音' },
  { id: 'youon', label: '拗音' },
]
const currentTab = ref('hiragana')
const showVideo = ref(false)
const videoEl = ref(null)

const showBoth = computed(() => currentTab.value === 'both')

// ===== 清音数据 =====
const seionVowels = ['a', 'i', 'u', 'e', 'o']
const seionData = [
  { label: '', kanas: [
    { h: 'あ', k: 'ア', romaji: 'a' }, { h: 'い', k: 'イ', romaji: 'i' },
    { h: 'う', k: 'ウ', romaji: 'u' }, { h: 'え', k: 'エ', romaji: 'e' },
    { h: 'お', k: 'オ', romaji: 'o' }
  ]},
  { label: 'k', kanas: [
    { h: 'か', k: 'カ', romaji: 'ka' }, { h: 'き', k: 'キ', romaji: 'ki' },
    { h: 'く', k: 'ク', romaji: 'ku' }, { h: 'け', k: 'ケ', romaji: 'ke' },
    { h: 'こ', k: 'コ', romaji: 'ko' }
  ]},
  { label: 's', kanas: [
    { h: 'さ', k: 'サ', romaji: 'sa' }, { h: 'し', k: 'シ', romaji: 'shi' },
    { h: 'す', k: 'ス', romaji: 'su' }, { h: 'せ', k: 'セ', romaji: 'se' },
    { h: 'そ', k: 'ソ', romaji: 'so' }
  ]},
  { label: 't', kanas: [
    { h: 'た', k: 'タ', romaji: 'ta' }, { h: 'ち', k: 'チ', romaji: 'chi' },
    { h: 'つ', k: 'ツ', romaji: 'tsu' }, { h: 'て', k: 'テ', romaji: 'te' },
    { h: 'と', k: 'ト', romaji: 'to' }
  ]},
  { label: 'n', kanas: [
    { h: 'な', k: 'ナ', romaji: 'na' }, { h: 'に', k: 'ニ', romaji: 'ni' },
    { h: 'ぬ', k: 'ヌ', romaji: 'nu' }, { h: 'ね', k: 'ネ', romaji: 'ne' },
    { h: 'の', k: 'ノ', romaji: 'no' }
  ]},
  { label: 'h', kanas: [
    { h: 'は', k: 'ハ', romaji: 'ha' }, { h: 'ひ', k: 'ヒ', romaji: 'hi' },
    { h: 'ふ', k: 'フ', romaji: 'fu' }, { h: 'へ', k: 'ヘ', romaji: 'he' },
    { h: 'ほ', k: 'ホ', romaji: 'ho' }
  ]},
  { label: 'm', kanas: [
    { h: 'ま', k: 'マ', romaji: 'ma' }, { h: 'み', k: 'ミ', romaji: 'mi' },
    { h: 'む', k: 'ム', romaji: 'mu' }, { h: 'め', k: 'メ', romaji: 'me' },
    { h: 'も', k: 'モ', romaji: 'mo' }
  ]},
  { label: 'y', kanas: [
    { h: 'や', k: 'ヤ', romaji: 'ya' }, null,
    { h: 'ゆ', k: 'ユ', romaji: 'yu' }, null,
    { h: 'よ', k: 'ヨ', romaji: 'yo' }
  ]},
  { label: 'r', kanas: [
    { h: 'ら', k: 'ラ', romaji: 'ra' }, { h: 'り', k: 'リ', romaji: 'ri' },
    { h: 'る', k: 'ル', romaji: 'ru' }, { h: 'れ', k: 'レ', romaji: 're' },
    { h: 'ろ', k: 'ロ', romaji: 'ro' }
  ]},
  { label: 'w', kanas: [
    { h: 'わ', k: 'ワ', romaji: 'wa' }, null, null, null,
    { h: 'を', k: 'ヲ', romaji: 'wo' }
  ]},
  { label: '', kanas: [
    { h: 'ん', k: 'ン', romaji: 'n' }, null, null, null, null
  ]},
]

// ===== 浊音数据 =====
const dakuonData = [
  { label: 'g', kanas: [
    { h: 'が', k: 'ガ', romaji: 'ga' }, { h: 'ぎ', k: 'ギ', romaji: 'gi' },
    { h: 'ぐ', k: 'グ', romaji: 'gu' }, { h: 'げ', k: 'ゲ', romaji: 'ge' },
    { h: 'ご', k: 'ゴ', romaji: 'go' }
  ]},
  { label: 'z', kanas: [
    { h: 'ざ', k: 'ザ', romaji: 'za' }, { h: 'じ', k: 'ジ', romaji: 'ji' },
    { h: 'ず', k: 'ズ', romaji: 'zu' }, { h: 'ぜ', k: 'ゼ', romaji: 'ze' },
    { h: 'ぞ', k: 'ゾ', romaji: 'zo' }
  ]},
  { label: 'd', kanas: [
    { h: 'だ', k: 'ダ', romaji: 'da' }, { h: 'ぢ', k: 'ヂ', romaji: 'di' },
    { h: 'づ', k: 'ヅ', romaji: 'du' }, { h: 'で', k: 'デ', romaji: 'de' },
    { h: 'ど', k: 'ド', romaji: 'do' }
  ]},
  { label: 'b', kanas: [
    { h: 'ば', k: 'バ', romaji: 'ba' }, { h: 'び', k: 'ビ', romaji: 'bi' },
    { h: 'ぶ', k: 'ブ', romaji: 'bu' }, { h: 'べ', k: 'ベ', romaji: 'be' },
    { h: 'ぼ', k: 'ボ', romaji: 'bo' }
  ]},
]

// ===== 半浊音数据 =====
const handakuonData = [
  { label: 'p', kanas: [
    { h: 'ぱ', k: 'パ', romaji: 'pa' }, { h: 'ぴ', k: 'ピ', romaji: 'pi' },
    { h: 'ぷ', k: 'プ', romaji: 'pu' }, { h: 'ぺ', k: 'ペ', romaji: 'pe' },
    { h: 'ぽ', k: 'ポ', romaji: 'po' }
  ]},
]

// ===== 拗音数据 =====
const youonVowels = ['ya', 'yu', 'yo']
const youonData = [
  { label: 'ky', kanas: [
    { h: 'きゃ', k: 'キャ', romaji: 'kya' }, { h: 'きゅ', k: 'キュ', romaji: 'kyu' }, { h: 'きょ', k: 'キョ', romaji: 'kyo' }
  ]},
  { label: 'sh', kanas: [
    { h: 'しゃ', k: 'シャ', romaji: 'sha' }, { h: 'しゅ', k: 'シュ', romaji: 'shu' }, { h: 'しょ', k: 'ショ', romaji: 'sho' }
  ]},
  { label: 'ch', kanas: [
    { h: 'ちゃ', k: 'チャ', romaji: 'cha' }, { h: 'ちゅ', k: 'チュ', romaji: 'chu' }, { h: 'ちょ', k: 'チョ', romaji: 'cho' }
  ]},
  { label: 'ny', kanas: [
    { h: 'にゃ', k: 'ニャ', romaji: 'nya' }, { h: 'にゅ', k: 'ニュ', romaji: 'nyu' }, { h: 'にょ', k: 'ニョ', romaji: 'nyo' }
  ]},
  { label: 'hy', kanas: [
    { h: 'ひゃ', k: 'ヒャ', romaji: 'hya' }, { h: 'ひゅ', k: 'ヒュ', romaji: 'hyu' }, { h: 'ひょ', k: 'ヒョ', romaji: 'hyo' }
  ]},
  { label: 'my', kanas: [
    { h: 'みゃ', k: 'ミャ', romaji: 'mya' }, { h: 'みゅ', k: 'ミュ', romaji: 'myu' }, { h: 'みょ', k: 'ミョ', romaji: 'myo' }
  ]},
  { label: 'ry', kanas: [
    { h: 'りゃ', k: 'リャ', romaji: 'rya' }, { h: 'りゅ', k: 'リュ', romaji: 'ryu' }, { h: 'りょ', k: 'リョ', romaji: 'ryo' }
  ]},
  { label: 'gy', kanas: [
    { h: 'ぎゃ', k: 'ギャ', romaji: 'gya' }, { h: 'ぎゅ', k: 'ギュ', romaji: 'gyu' }, { h: 'ぎょ', k: 'ギョ', romaji: 'gyo' }
  ]},
  { label: 'j', kanas: [
    { h: 'じゃ', k: 'ジャ', romaji: 'ja' }, { h: 'じゅ', k: 'ジュ', romaji: 'ju' }, { h: 'じょ', k: 'ジョ', romaji: 'jo' }
  ]},
  { label: 'by', kanas: [
    { h: 'びゃ', k: 'ビャ', romaji: 'bya' }, { h: 'びゅ', k: 'ビュ', romaji: 'byu' }, { h: 'びょ', k: 'ビョ', romaji: 'byo' }
  ]},
  { label: 'py', kanas: [
    { h: 'ぴゃ', k: 'ピャ', romaji: 'pya' }, { h: 'ぴゅ', k: 'ピュ', romaji: 'pyu' }, { h: 'ぴょ', k: 'ピョ', romaji: 'pyo' }
  ]},
]

// 给每个 kana 加唯一 id
let _id = 0
function addIds(rows) {
  return rows.map(row => ({
    ...row,
    kanas: row.kanas.map(k => k ? { ...k, id: _id++ } : null)
  }))
}
const seion = addIds(seionData)
const dakuon = addIds(dakuonData)
const handakuon = addIds(handakuonData)
const youon = addIds(youonData)

// 当前显示的行和列头
const currentVowels = computed(() => {
  if (currentTab.value === 'youon') return youonVowels
  return seionVowels
})

const currentRows = computed(() => {
  switch (currentTab.value) {
    case 'hiragana': return seion
    case 'katakana': return seion
    case 'both': return seion
    case 'dakuon': return dakuon
    case 'handakuon': return handakuon
    case 'youon': return youon
    default: return seion
  }
})

function displayMain(kana) {
  if (currentTab.value === 'katakana') return kana.k
  return kana.h
}
function displaySub(kana) {
  if (currentTab.value === 'both') return kana.k
  return ''
}

// 发音
const playingKana = ref(null)
const speechRate = ref(0.8)
const speedIcon = computed(() => speechRate.value <= 0.6 ? '🐢' : speechRate.value <= 0.9 ? '🔈' : '🐇')

function toggleSpeed() {
  if (speechRate.value <= 0.6) speechRate.value = 0.8
  else if (speechRate.value <= 0.9) speechRate.value = 1.2
  else speechRate.value = 0.5
}

function speakKana(kana) {
  if (!kana) return
  playingKana.value = kana.id
  
  const text = kana.h
  speechSynthesis.cancel()
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    u.rate = speechRate.value
    u.volume = 0.8
    u.onend = () => { playingKana.value = null }
    speechSynthesis.speak(u)
  }, 50)
  
  setTimeout(() => { playingKana.value = null }, 2000)
}

// 自动朗读
const autoPlaying = ref(false)
let autoPlayTimer = null

function toggleAutoPlay() {
  if (autoPlaying.value) { stopAutoPlay() } else { startAutoPlay() }
}

function startAutoPlay() {
  autoPlaying.value = true
  const allKanas = []
  currentRows.value.forEach(row => {
    row.kanas.forEach(k => { if (k) allKanas.push(k) })
  })
  
  let i = 0
  function playNext() {
    if (!autoPlaying.value || i >= allKanas.length) {
      autoPlaying.value = false
      return
    }
    speakKana(allKanas[i])
    i++
    const delay = speechRate.value <= 0.6 ? 2000 : speechRate.value <= 0.9 ? 1500 : 1000
    autoPlayTimer = setTimeout(playNext, delay)
  }
  playNext()
}

function stopAutoPlay() {
  autoPlaying.value = false
  if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null }
  speechSynthesis.cancel()
  playingKana.value = null
}

// BGM
const bgmPlaying = ref(false)
let bgmAudio = null

function toggleBgm() {
  if (bgmPlaying.value) { stopBgm() } else { startBgm() }
}
function startBgm() {
  if (!bgmAudio) {
    bgmAudio = new Audio('/sounds/gojuon-song.mp3')
    bgmAudio.loop = true
    bgmAudio.volume = 0.3
    bgmAudio.onended = () => { bgmPlaying.value = false }
  }
  bgmAudio.play().then(() => { bgmPlaying.value = true }).catch(() => { bgmPlaying.value = false })
}
function stopBgm() {
  if (bgmAudio) { bgmAudio.pause(); bgmAudio.currentTime = 0 }
  bgmPlaying.value = false
}

function goBack() {
  stopAutoPlay()
  stopBgm()
  if (videoEl.value) videoEl.value.pause()
  router.back()
}

onUnmounted(() => {
  stopAutoPlay()
  stopBgm()
})
</script>
