<template>
  <div class="voice-dojo h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100 relative overflow-hidden">
    <!-- 背景裝飾 -->
    <div class="absolute inset-0">
      <div class="absolute top-1/4 left-10 w-32 h-32 bg-teal-200 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute top-3/4 right-20 w-24 h-24 bg-blue-200 rounded-full opacity-25 animate-float"></div>
      <div class="absolute bottom-10 left-1/3 w-20 h-20 bg-cyan-200 rounded-full opacity-30 animate-bounce"></div>
    </div>

    <!-- 頂部信息欄 -->
    <div class="relative z-10 flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm">
      <!-- 返回按鈕 -->
      <button @click="goBack" class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
        <span>←</span>
        <span>返回</span>
      </button>

      <!-- 關卡標題 -->
      <div class="flex items-center space-x-2">
        <h2 class="text-lg font-bold text-gray-800">{{ props.stageConfig.title || props.stageConfig.name_cn || '語音道場' }}</h2>
      </div>

      <!-- 道場信息 -->
      <div class="flex items-center space-x-6">
        <!-- 當前進度 -->
        <div class="text-lg">
          <span class="font-bold text-teal-600">{{ currentIndex + 1 }}</span>
          <span class="text-gray-500">/{{ practiceItems.length }}</span>
        </div>

        <!-- 總分 -->
        <div class="flex items-center space-x-2">
          <span>🎯</span>
          <span class="text-xl font-bold text-blue-600">{{ totalScore }}</span>
        </div>

        <!-- 平均分 -->
        <div v-if="completedCount > 0" class="flex items-center space-x-2">
          <span>📊</span>
          <span class="text-lg">平均: {{ Math.round(totalScore / completedCount) }}</span>
        </div>
      </div>
    </div>

    <!-- 主要內容區 -->
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="max-w-2xl w-full">
        
        <!-- NPC 師父區域 -->
        <div class="text-center mb-8">
          <div class="master-avatar mb-4">
            <div class="text-8xl animate-bounce" 
                 :class="{ 'animate-pulse': isPlaying }">
              🦊
            </div>
          </div>
          <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-2">小狐師父</h3>
            <p class="text-gray-600 mb-4">
              {{ getMasterMessage() }}
            </p>
            
            <!-- 師父示範按鈕 -->
            <button @click="playDemo" 
                    :disabled="isPlaying || isRecording"
                    class="px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white rounded-lg transition-colors">
              {{ isPlaying ? '播放中...' : '🔊 聽示範' }}
            </button>
          </div>
        </div>

        <!-- 練習區域 -->
        <div v-if="currentItem" class="practice-area bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          
          <!-- 當前練習項目 -->
          <div class="text-center mb-8">
            <div class="text-6xl font-bold text-gray-800 mb-4">
              {{ currentItem.hiragana || currentItem.word || currentItem.sentence }}
            </div>
            <div v-if="currentItem.romaji" class="text-2xl text-gray-500 mb-2">
              {{ currentItem.romaji }}
            </div>
            <div v-if="currentItem.meaning" class="text-lg text-gray-600">
              {{ currentItem.meaning }}
            </div>
          </div>

          <!-- 錄音控制區 -->
          <div class="recording-area text-center mb-8">
            
            <!-- 麥克風按鈕 -->
            <div class="mic-container mb-6">
              <button @click="toggleRecording"
                      :disabled="isPlaying || !speechSupported"
                      :class="[
                        'mic-button',
                        {
                          'recording': isRecording,
                          'disabled': !speechSupported
                        }
                      ]">
                <span class="mic-icon">🎤</span>
              </button>
              
              <!-- 音波可視化 -->
              <div v-if="isRecording" class="sound-waves">
                <div v-for="i in 5" :key="i" 
                     class="wave" 
                     :style="{ animationDelay: `${i * 0.1}s` }">
                </div>
              </div>
            </div>

            <!-- 錄音狀態提示 -->
            <div class="recording-status mb-4">
              <p v-if="!speechSupported" class="text-red-500">
                ⚠️ 您的瀏覽器不支持語音識別
              </p>
              <p v-else-if="isRecording" class="text-teal-600 animate-pulse">
                🎙️ 正在錄音... 請開始朗讀
              </p>
              <p v-else-if="isProcessing" class="text-blue-600">
                🔄 正在分析您的發音...
              </p>
              <p v-else class="text-gray-600">
                按住麥克風按鈕開始錄音
              </p>
            </div>

          </div>

          <!-- 評分結果 -->
          <div v-if="currentScore !== null" class="score-result text-center">
            
            <!-- 分數顯示 -->
            <div class="score-display mb-6">
              <div class="text-5xl font-bold mb-2" 
                   :class="{
                     'text-green-500': currentScore >= 90,
                     'text-yellow-500': currentScore >= 70 && currentScore < 90,
                     'text-orange-500': currentScore >= 60 && currentScore < 70,
                     'text-red-500': currentScore < 60
                   }">
                {{ currentScore }}
              </div>
              <div class="text-gray-600">分數</div>
            </div>

            <!-- 星級評分 -->
            <div class="star-rating mb-6">
              <div class="flex justify-center items-center space-x-1 mb-2">
                <span v-for="i in 3" :key="i" 
                      :class="i <= getStars(currentScore) ? 'text-yellow-500' : 'text-gray-300'"
                      class="text-4xl animate-bounce"
                      :style="{ animationDelay: `${i * 0.1}s` }">
                  ⭐
                </span>
              </div>
              <div class="text-lg text-gray-600">
                {{ getScoreMessage(currentScore) }}
              </div>
            </div>

            <!-- 識別結果 -->
            <div v-if="recognizedText" class="recognized-text mb-6 p-4 bg-gray-100 rounded-lg">
              <p class="text-sm text-gray-600 mb-1">識別結果:</p>
              <p class="text-lg">{{ recognizedText }}</p>
            </div>

            <!-- 操作按鈕 -->
            <div class="action-buttons flex justify-center space-x-4">
              <button @click="retryCurrentItem" 
                      class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                🔄 重新錄音
              </button>
              <button @click="nextItem" 
                      :disabled="currentIndex >= practiceItems.length - 1"
                      class="px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white rounded-lg transition-colors">
                {{ currentIndex >= practiceItems.length - 1 ? '✅ 完成' : '➡️ 下一個' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 練習完成彈窗 -->
    <div v-if="practiceCompleted" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="mb-6">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold mb-2">語音練習完成！</h2>
          <div class="flex justify-center items-center space-x-1 mb-4">
            <span v-for="i in 3" :key="i" 
                  :class="i <= finalStars ? 'text-yellow-500' : 'text-gray-300'"
                  class="text-3xl animate-bounce"
                  :style="{ animationDelay: `${i * 0.1}s` }">
              ⭐
            </span>
          </div>
          <div class="space-y-2 text-gray-600">
            <p>總分: <span class="font-bold text-blue-600">{{ totalScore }}</span></p>
            <p>平均分: <span class="font-bold text-green-600">{{ Math.round(totalScore / practiceItems.length) }}</span></p>
            <p>滿分次數: <span class="font-bold text-yellow-600">{{ perfectCount }}</span></p>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button @click="restartPractice" 
                  class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
            重新練習
          </button>
          <button @click="submitResult" :disabled="submitting"
                  class="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors">
            {{ submitting ? '提交中...' : '完成練習' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 隱藏的音頻元素 -->
    <audio ref="demoAudio" @ended="isPlaying = false" preload="auto"></audio>
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
const gameData = ref(props.stageConfig.game_data)
const practiceItems = ref(gameData.value.items || [])
const passingScore = ref(gameData.value.passing_score || 60)
const currentIndex = ref(0)
const currentScore = ref(null)
const totalScore = ref(0)
const completedCount = ref(0)
const perfectCount = ref(0)
const practiceCompleted = ref(false)
const finalStars = ref(0)
const submitting = ref(false)

// 語音相關
const speechSupported = ref(false)
const isRecording = ref(false)
const isProcessing = ref(false)
const isPlaying = ref(false)
const recognizedText = ref('')
const recognition = ref(null)

// 計算屬性
const currentItem = computed(() => {
  return practiceItems.value[currentIndex.value] || null
})

// 初始化語音識別
function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    speechSupported.value = false
    console.warn('瀏覽器不支持語音識別')
    return
  }

  speechSupported.value = true
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition.value = new SpeechRecognition()
  
  recognition.value.lang = 'ja-JP'
  recognition.value.continuous = false
  recognition.value.interimResults = false
  recognition.value.maxAlternatives = 1

  recognition.value.onstart = () => {
    isRecording.value = true
    isProcessing.value = false
  }

  recognition.value.onresult = (event) => {
    if (event.results.length > 0) {
      const transcript = event.results[0][0].transcript
      recognizedText.value = transcript
      calculateScore(transcript)
    }
  }

  recognition.value.onerror = (event) => {
    console.error('語音識別錯誤:', event.error)
    isRecording.value = false
    isProcessing.value = false
    
    if (event.error === 'no-speech') {
      gameStore.setError('未檢測到語音，請重試')
    } else if (event.error === 'not-allowed') {
      gameStore.setError('麥克風權限被拒絕，請在瀏覽器設置中允許麥克風訪問')
    } else {
      gameStore.setError('語音識別失敗，請重試')
    }
  }

  recognition.value.onend = () => {
    isRecording.value = false
    isProcessing.value = false
  }
}

// 切換錄音狀態
function toggleRecording() {
  if (!speechSupported.value) return

  if (isRecording.value) {
    // 停止錄音
    recognition.value.stop()
  } else {
    // 開始錄音
    isProcessing.value = true
    currentScore.value = null
    recognizedText.value = ''
    
    try {
      recognition.value.start()
    } catch (error) {
      console.error('啟動語音識別失敗:', error)
      isProcessing.value = false
      gameStore.setError('無法啟動語音識別，請重試')
    }
  }
}

// 預加載語音列表
const jaVoice = ref(null)
function loadVoices() {
  if (!('speechSynthesis' in window)) return
  const voices = speechSynthesis.getVoices()
  // 優先找日語語音
  jaVoice.value = voices.find(v => v.lang === 'ja-JP')
    || voices.find(v => v.lang.startsWith('ja'))
    || null
  console.log('Available voices:', voices.length, 'Japanese voice:', jaVoice.value?.name || 'none')
}
if ('speechSynthesis' in window) {
  loadVoices()
  speechSynthesis.onvoiceschanged = loadVoices
}

// 用 Google Translate TTS 播放日語（免費，無需API key）
function playWithGoogleTTS(text) {
  const audio = new Audio(
    `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(text)}`
  )
  audio.onended = () => { isPlaying.value = false }
  audio.onerror = () => {
    isPlaying.value = false
    // Google TTS 也失败，尝试浏览器 SpeechSynthesis
    playWithSpeechSynthesis(text)
  }
  audio.play().catch(() => {
    isPlaying.value = false
    playWithSpeechSynthesis(text)
  })
}

// 浏览器原生 SpeechSynthesis 备选
function playWithSpeechSynthesis(text) {
  if (!('speechSynthesis' in window)) {
    isPlaying.value = false
    return
  }
  isPlaying.value = true
  if (!jaVoice.value) loadVoices()
  speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = 0.8
  if (jaVoice.value) utterance.voice = jaVoice.value
  utterance.onend = () => { isPlaying.value = false }
  utterance.onerror = () => { isPlaying.value = false }
  speechSynthesis.speak(utterance)
  
  setTimeout(() => { if (isPlaying.value) isPlaying.value = false }, 5000)
}

// 播放示範
function playDemo() {
  if (isPlaying.value || !currentItem.value) return
  isPlaying.value = true
  
  const text = currentItem.value.hiragana || currentItem.value.word || currentItem.value.sentence
  // 優先用 Google TTS（跨平台可靠）
  playWithGoogleTTS(text)
}

// 計算發音分數
function calculateScore(recognizedText) {
  isProcessing.value = true
  
  const target = (currentItem.value.hiragana || currentItem.value.word || currentItem.value.sentence).toLowerCase()
  const recognized = recognizedText.toLowerCase()
  
  // 使用 Levenshtein 距離算法計算相似度
  const distance = levenshteinDistance(target, recognized)
  const maxLength = Math.max(target.length, recognized.length)
  const similarity = 1 - (distance / maxLength)
  const score = Math.max(0, Math.round(similarity * 100))
  
  currentScore.value = score
  totalScore.value += score
  completedCount.value++
  
  if (score >= 90) {
    perfectCount.value++
  }
  
  isProcessing.value = false
}

// Levenshtein 距離算法
function levenshteinDistance(str1, str2) {
  const matrix = []
  
  // 初始化矩陣
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  // 填充矩陣
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 替換
          matrix[i][j - 1] + 1,     // 插入
          matrix[i - 1][j] + 1      // 刪除
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// 獲取星級
function getStars(score) {
  if (score >= 90) return 3
  if (score >= 70) return 2
  if (score >= 60) return 1
  return 0
}

// 獲取分數評語
function getScoreMessage(score) {
  if (score >= 90) return '完美發音！'
  if (score >= 70) return '發音很好！'
  if (score >= 60) return '發音不錯'
  return '需要多練習'
}

// 獲取師父的話
function getMasterMessage() {
  if (currentScore.value === null) {
    return '歡迎來到語音道場！先聽我示範，然後按住麥克風跟我一起讀。'
  }
  
  if (currentScore.value >= 90) {
    return '太棒了！你的發音非常標準！'
  } else if (currentScore.value >= 70) {
    return '很好！繼續保持這個水平。'
  } else if (currentScore.value >= 60) {
    return '不錯，再多練習一下會更好。'
  } else {
    return '不要氣餒，多聽多練才能進步。'
  }
}

// 重試當前項目
function retryCurrentItem() {
  currentScore.value = null
  recognizedText.value = ''
  totalScore.value -= (currentScore.value || 0)
  if (completedCount.value > 0) {
    completedCount.value--
  }
}

// 下一個項目
function nextItem() {
  if (currentIndex.value >= practiceItems.value.length - 1) {
    // 完成所有練習
    completePractice()
  } else {
    currentIndex.value++
    currentScore.value = null
    recognizedText.value = ''
  }
}

// 完成練習
function completePractice() {
  practiceCompleted.value = true
  
  // 計算最終星級
  const averageScore = totalScore.value / practiceItems.value.length
  if (averageScore >= 85 && perfectCount.value >= 2) {
    finalStars.value = 3
  } else if (averageScore >= 75) {
    finalStars.value = 2
  } else if (averageScore >= passingScore.value) {
    finalStars.value = 1
  } else {
    finalStars.value = 0
  }
}

// 重新開始練習
function restartPractice() {
  currentIndex.value = 0
  currentScore.value = null
  totalScore.value = 0
  completedCount.value = 0
  perfectCount.value = 0
  practiceCompleted.value = false
  recognizedText.value = ''
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
        score: totalScore.value,
        time_spent: completedCount.value * 30, // 估算時間
        stars: finalStars.value,
        answers: {
          total_score: totalScore.value,
          average_score: Math.round(totalScore.value / practiceItems.value.length),
          perfect_count: perfectCount.value,
          completed_count: completedCount.value
        }
      }
    )
    
    if (result.success) {
      // 顯示獎勵
      authStore.addExp(result.rewards.exp)
      authStore.addCoins(result.rewards.coins)
      
      // 更新每日任務進度
      await gameStore.completeDailyTask('voice_practice')
      
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
  if (isRecording.value) {
    recognition.value?.stop()
  }
  if (isPlaying.value && 'speechSynthesis' in window) {
    speechSynthesis.cancel()
  }
  router.back()
}

// 生命週期
onMounted(() => {
  initSpeechRecognition()
})

onUnmounted(() => {
  if (isRecording.value) {
    recognition.value?.stop()
  }
  if (isPlaying.value && 'speechSynthesis' in window) {
    speechSynthesis.cancel()
  }
})
</script>

<style scoped>
/* 浮動動畫 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* 麥克風按鈕樣式 */
.mic-button {
  @apply w-24 h-24 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center text-3xl transition-all duration-300 transform hover:scale-110;
}

.mic-button.recording {
  @apply bg-red-500 animate-pulse;
}

.mic-button.disabled {
  @apply bg-gray-400 cursor-not-allowed transform-none;
}

.mic-icon {
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

/* 音波可視化 */
.sound-waves {
  @apply flex justify-center items-center space-x-1 mt-4;
}

.wave {
  @apply w-1 bg-teal-400 rounded-full;
  height: 20px;
  animation: wave 1s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { height: 20px; }
  50% { height: 40px; }
}

/* 分數顯示動畫 */
.score-display {
  animation: scoreReveal 0.8s ease-out;
}

@keyframes scoreReveal {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 響應式 */
@media (max-width: 768px) {
  .mic-button {
    @apply w-20 h-20 text-2xl;
  }
  
  .master-avatar .text-8xl {
    font-size: 4rem;
  }
  
  .practice-area .text-6xl {
    font-size: 3rem;
  }
  
  .score-display .text-5xl {
    font-size: 2.5rem;
  }
}
</style>