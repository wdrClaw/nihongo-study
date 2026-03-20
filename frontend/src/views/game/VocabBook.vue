<template>
  <div class="min-h-screen bg-gradient-to-b from-background-primary to-background-secondary">
    <!-- 顶部导航 -->
    <div class="sticky top-0 z-20 bg-white/90 backdrop-blur-sm shadow-sm">
      <div class="flex items-center justify-between px-4 h-[50px]">
        <button @click="goBack" class="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 active:bg-gray-200">
          <span>←</span>
          <span class="text-sm">返回</span>
        </button>
        <h1 class="text-lg font-bold text-text-primary">📚 词汇手册</h1>
        <div class="w-16"></div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="px-4 py-3 overflow-x-auto">
      <div class="flex space-x-2 min-w-max">
        <button v-for="cat in categories" :key="cat.name"
                @click="selectCategory(cat)"
                class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all"
                :class="currentCategory === cat.name 
                  ? 'bg-primary-400 text-white shadow-md' 
                  : 'bg-white text-text-secondary border border-gray-200'">
          {{ cat.icon }} {{ cat.name_cn }}
        </button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
    </div>

    <!-- 词汇列表 -->
    <div v-else class="px-4 pb-20 space-y-2">
      <div v-for="(word, i) in words" :key="i"
           @click="speakWord(word)"
           class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-all">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <div class="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-xs font-bold text-primary-400 flex-shrink-0">
            {{ i + 1 }}
          </div>
          <div class="min-w-0">
            <div class="flex items-center space-x-2">
              <span class="text-lg font-bold text-text-primary">{{ word.japanese }}</span>
              <span v-if="word.reading && word.reading !== word.japanese" class="text-xs text-text-light">{{ word.reading }}</span>
            </div>
            <div class="text-sm text-text-secondary">{{ word.chinese }}</div>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <span class="text-xs text-text-light">{{ word.romaji }}</span>
          <span class="text-lg">🔊</span>
        </div>
      </div>

      <div v-if="words.length === 0" class="text-center py-10 text-text-secondary">
        暂无词汇数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])
const words = ref([])
const currentCategory = ref('')
const loading = ref(false)

const baseURL = `http://${window.location.hostname}:3002/api`

async function loadCategories() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${baseURL}/vocab/categories/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success && data.categories) {
      categories.value = data.categories
      if (data.categories.length > 0) {
        selectCategory(data.categories[0])
      }
    }
  } catch (e) {
    console.error('加载分类失败:', e)
  }
}

async function selectCategory(cat) {
  currentCategory.value = cat.name
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${baseURL}/vocab/${cat.name}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    words.value = data.success ? data.words : []
  } catch (e) {
    console.error('加载词汇失败:', e)
    words.value = []
  } finally {
    loading.value = false
  }
}

function speakWord(word) {
  const text = word.reading || word.japanese
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

function goBack() {
  router.back()
}

onMounted(() => {
  loadCategories()
})
</script>
