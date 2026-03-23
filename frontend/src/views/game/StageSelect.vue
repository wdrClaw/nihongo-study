<template>
  <div class="ss-page">
    <!-- 背景图层 -->
    <div class="ss-bg" :style="bgStyle"></div>
    <div class="ss-overlay"></div>

    <!-- 顶栏：返回 + 标题 一行 -->
    <div class="ss-topbar">
      <button class="ss-back-float" @click="goBack">
        <ChevronLeft :size="20" :stroke-width="2.5" />
      </button>
      <div class="ss-topbar-title">
        <span class="ss-dot">·</span>
        <span>{{ getAreaDescription() }}</span>
        <span class="ss-dot">·</span>
      </div>
      <div class="ss-topbar-spacer"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ss-loading">
      <div class="ss-spinner"></div>
      <p>加載關卡中...</p>
    </div>

    <!-- 内容区域 -->
    <div v-else class="ss-content">

      <!-- ======== 区域进度卡 ======== -->
      <div class="progress-card">
        <!-- 上半：标题+进度条+EXP（左） + 奖章（右） -->
        <div class="pc-main">
          <div class="pc-left">
            <h2 class="pc-title">區域進度</h2>
            <!-- 进度条 -->
            <div class="pc-bar">
              <div class="pc-bar-fill" :style="{ width: progressPct }">
                <span class="pc-bar-text">{{ progressPct }}</span>
              </div>
            </div>
            <!-- EXP -->
            <div class="pc-exp">
              <span class="pc-exp-tag">EXP</span>
              <span class="pc-exp-num">{{ authStore.userExp || 0 }} / {{ nextLevelExp }}</span>
            </div>
          </div>
          <!-- 右：奖章 -->
          <div class="pc-medal">
            <svg class="pc-medal-svg" viewBox="0 0 90 95" width="72" height="76">
              <g opacity="0.85">
                <ellipse cx="20" cy="40" rx="5" ry="11" fill="#8DB858" transform="rotate(-25 20 40)"/>
                <ellipse cx="17" cy="52" rx="4.5" ry="9" fill="#9CC462" transform="rotate(-12 17 52)"/>
                <ellipse cx="17" cy="62" rx="4" ry="8" fill="#AED670" transform="rotate(0 17 62)"/>
                <ellipse cx="20" cy="71" rx="3.5" ry="7" fill="#C0E07E" transform="rotate(10 20 71)"/>
              </g>
              <g opacity="0.85">
                <ellipse cx="70" cy="40" rx="5" ry="11" fill="#8DB858" transform="rotate(25 70 40)"/>
                <ellipse cx="73" cy="52" rx="4.5" ry="9" fill="#9CC462" transform="rotate(12 73 52)"/>
                <ellipse cx="73" cy="62" rx="4" ry="8" fill="#AED670" transform="rotate(0 73 62)"/>
                <ellipse cx="70" cy="71" rx="3.5" ry="7" fill="#C0E07E" transform="rotate(-10 70 71)"/>
              </g>
              <defs>
                <linearGradient id="gMedal" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#FFE89A"/><stop offset="50%" stop-color="#FFD54F"/><stop offset="100%" stop-color="#FFC107"/>
                </linearGradient>
              </defs>
              <circle cx="45" cy="46" r="20" fill="url(#gMedal)" stroke="#E6A200" stroke-width="2"/>
              <polygon points="45,30 48.5,40 59,40 50.5,47 54,57 45,51 36,57 39.5,47 31,40 41.5,40" fill="#FFF176" stroke="#FBC02D" stroke-width="0.8"/>
            </svg>
            <div class="pc-ribbon">完成度:{{ progressPct }}</div>
          </div>
        </div>
        <!-- 下半：三个统计 -->
        <div class="pc-stats">
          <div class="pc-stat">
            <span class="pc-stat-num pc-num-blue">{{ areaProgress.completed }}</span>
            <span class="pc-stat-label">已完成</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-num pc-num-gold">{{ areaProgress.stars }}</span>
            <span class="pc-stat-label">獲得星星</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-num pc-num-green">{{ areaProgress.perfect }}</span>
            <span class="pc-stat-label">三星關卡</span>
          </div>
        </div>
      </div>

      <!-- ======== 五十音図入口 ======== -->
      <div v-if="knowledgeEntry" class="kana-entry" @click="$router.push(knowledgeEntry.route)">
        <div class="ke-icon"><BookOpen :size="32" color="#2E7D32" :stroke-width="2" /></div>
        <div class="ke-text">
          <h3>{{ knowledgeEntry.title }}</h3>
          <p>{{ knowledgeEntry.desc }}</p>
        </div>
        <div class="ke-arrow"><ArrowRight :size="22" color="#FF7043" :stroke-width="2.5" /></div>
      </div>

      <!-- ======== 关卡卡片列表 ======== -->
      <div v-for="stage in stages" :key="stage.stage_id"
           class="level-card" :class="{ 'lc-locked': !stage.unlocked }"
           @click="selectStage(stage)">
        
        <!-- 左插画 -->
        <div class="lc-illust" :class="{ 'lc-illust-locked': !stage.unlocked }">
          <div class="lc-controller"><Gamepad2 :size="28" color="white" :stroke-width="2" /></div>
          <div v-if="!stage.unlocked" class="lc-lock-badge"><Lock :size="10" /> 未解鎖</div>
        </div>

        <!-- 右信息 -->
        <div class="lc-info">
          <!-- 顶行：第X关 + 金币(锁定时) -->
          <div class="lc-top-row">
            <span class="lc-stage-num">第{{ stage.stage_id }}關</span>
            <div v-if="!stage.unlocked" class="lc-coin-cost">
              <Coins :size="14" />
              <span>{{ 185 + (stage.stage_id - 1) * 50 }}</span>
            </div>
            <div v-else-if="stage.unlocked && stage.stars === 0" class="lc-arrow">
              <ArrowRight :size="20" color="#FF7043" :stroke-width="2.5" />
            </div>
          </div>

          <!-- 标题 -->
          <h3 class="lc-name" :class="{ 'lc-name-locked': !stage.unlocked }">
            {{ stage.name_cn || `关卡 ${stage.stage_id}` }}
          </h3>

          <!-- 描述 -->
          <p class="lc-desc" :class="{ 'lc-desc-locked': !stage.unlocked }">
            {{ stage.description_cn }}
          </p>

          <!-- 底行：分数+星星+按钮 -->
          <div class="lc-bottom-row">
            <div class="lc-bottom-left">
              <div v-if="stage.best_score > 0" class="lc-score">
                <Trophy :size="14" color="#FF8F00" :stroke-width="2.5" />
                <span>Best: {{ stage.best_score }}</span>
              </div>
              <div class="lc-stars">
                <Star v-for="i in 3" :key="i" :size="16" :stroke-width="2"
                      :fill="i <= stage.stars ? '#FFB300' : 'none'"
                      :color="i <= stage.stars ? '#FF8F00' : '#CBD5E1'"
                      :class="i <= stage.stars ? 'lc-star-on' : ''" />
              </div>
            </div>
            <button v-if="stage.stars > 0" class="lc-btn lc-btn-replay">再來一局</button>
            <button v-else-if="stage.unlocked" class="lc-btn lc-btn-start">開始挑戰</button>
          </div>
        </div>
      </div>

      <!-- 无关卡 -->
      <div v-if="stages.length === 0" class="ss-empty">
        <div class="ss-empty-icon">🏗️</div>
        <h3>關卡建設中</h3>
        <p>敬請期待！</p>
      </div>

      <div class="ss-bottom-spacer"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import { 
  ChevronLeft, Coins, Trophy, Star, Lock, 
  Gamepad2, BookOpen, ArrowRight, Sparkles,
  Target, Mic, Zap, Crosshair, Swords
} from 'lucide-vue-next'

const props = defineProps({ areaId: { type: [String, Number], required: true } })
const gameStore = useGameStore()
const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const stages = ref([])

// 计算
const areaProgress = computed(() => {
  let completed = 0, stars = 0, perfect = 0
  stages.value.forEach(s => {
    if (s.stars > 0) completed++
    stars += s.stars
    if (s.stars >= 3) perfect++
  })
  return { completed, total: stages.value.length, stars, perfect }
})

const progressPct = computed(() => {
  if (!areaProgress.value.total) return '0%'
  return Math.round(areaProgress.value.completed / areaProgress.value.total * 100) + '%'
})

const nextLevelExp = computed(() => {
  const lv = authStore.userLevel || 1
  if (lv <= 10) return lv * 100
  if (lv <= 25) return 1000 + (lv - 10) * 150
  return 3000
})
const expPct = computed(() => {
  const exp = authStore.userExp || 0
  const next = nextLevelExp.value
  return next > 0 ? Math.min(100, Math.round(exp / next * 100)) : 0
})

// 背景
const bgMap = { 1: '/images/bg-island.png' }
const bgStyle = computed(() => {
  const bg = bgMap[props.areaId]
  if (!bg) return { background: 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 50%, #C8E6C9 100%)' }
  return { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
})

// 区域
const areaMap = {
  1: { name: '五十音島', desc: '學習假名的起點' },
  2: { name: '詞彙島', desc: '1000日常詞彙' },
  3: { name: '語法城', desc: '掌握語法的要塞' },
  4: { name: '會話廣場', desc: '練習對話的舞台' },
  5: { name: '讀解森林', desc: '提升理解的森林' },
  6: { name: 'N5試煉塔', desc: '最終挑戰的高塔' }
}

const knowledgeMap = {
  1: { icon: '📖', title: '五十音図', desc: '點擊查看完整發音 + 聽讀練習', route: '/game/gojuon' },
  2: { icon: '📚', title: '詞彙手冊', desc: '按分類瀏覽全部日常詞彙', route: '/game/vocab-book' },
  3: { icon: '📝', title: '語法手冊', desc: 'N5基礎語法速查', route: '/game/grammar-book' },
  4: { icon: '💬', title: '會話手冊', desc: '常用日語對話場景', route: '/game/conversation-book' },
}
const knowledgeEntry = computed(() => knowledgeMap[props.areaId] || null)

function getAreaName() { return areaMap[props.areaId]?.name || `區域 ${props.areaId}` }
function getAreaDescription() { return areaMap[props.areaId]?.desc || '' }

function selectStage(s) {
  if (!s.unlocked) return
  router.push(`/game/area/${props.areaId}/stage/${s.stage_id}`)
}
function goBack() { router.push('/game/map') }

async function loadStages() {
  try {
    loading.value = true
    const result = await gameStore.loadAreaStages(props.areaId)
    stages.value = result.success ? result.stages : []
  } catch (e) { console.error(e); stages.value = [] }
  finally { loading.value = false }
}

onMounted(() => loadStages())
</script>

<style scoped>
/* ============================================
   全局
   ============================================ */
.ss-page {
  min-height: 100vh; min-height: 100dvh;
  position: relative; overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans SC', sans-serif;
}
.ss-bg {
  position: fixed; inset: 0; z-index: 0;
  background-size: cover; background-position: center;
}
.ss-overlay {
  position: fixed; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(0,0,0,0.03) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.08) 100%);
}

/* ============================================
   顶栏
   ============================================ */
.ss-topbar {
  position: relative; z-index: 20;
  display: flex; align-items: center;
  padding: 14px 16px 6px;
}
.ss-back-float {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex; align-items: center; justify-content: center;
  color: #555; cursor: pointer; transition: all .15s;
  flex-shrink: 0;
}
.ss-back-float:active { transform: scale(0.9); }
.ss-topbar-title {
  flex: 1; text-align: center;
  font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.95);
  text-shadow: 0 1px 6px rgba(0,0,0,0.2); letter-spacing: 2px;
}
.ss-topbar-spacer { width: 32px; flex-shrink: 0; }

/* ============================================
   副标题
   ============================================ */
.ss-dot { margin: 0 6px; opacity: 0.6; }

/* ============================================
   Loading
   ============================================ */
.ss-loading { position: relative; z-index: 2; text-align: center; padding: 80px 0; }
.ss-spinner {
  width: 36px; height: 36px; margin: 0 auto 12px;
  border: 3px solid rgba(255,255,255,0.4); border-top-color: white;
  border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.ss-loading p { color: rgba(255,255,255,0.9); font-size: 14px; }

/* ============================================
   Content
   ============================================ */
.ss-content {
  position: relative; z-index: 2;
  padding: 8px 16px 40px; display: flex; flex-direction: column; gap: 14px;
}

/* ============================================
   ProgressCard 区域进度卡
   ============================================ */

.progress-card {
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-radius: 20px; padding: 14px 16px;
  border: 1.5px solid rgba(255,255,255,0.4);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

/* 上半：左右布局 */
.pc-main {
  display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px;
}
.pc-left { flex: 1; min-width: 0; }
.pc-title {
  font-size: 17px; font-weight: 800; color: #3a4a5c; margin: 0 0 8px;
}

/* 进度条 */
.pc-bar {
  height: 20px; background: rgba(200,210,225,0.35);
  border-radius: 10px; overflow: hidden; margin-bottom: 6px;
}
.pc-bar-fill {
  height: 100%; border-radius: 10px; position: relative;
  background: linear-gradient(90deg, #7EC8E3, #4A9BBF);
  transition: width .8s ease;
  display: flex; align-items: center; padding-left: 10px;
  min-width: 50px;
}
.pc-bar-text {
  font-size: 11px; font-weight: 800; color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

/* EXP */
.pc-exp {
  display: flex; align-items: center; gap: 6px;
}
.pc-exp-tag {
  background: #4A6580; color: #B8DCF0; font-size: 9px; font-weight: 800;
  padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px; flex-shrink: 0;
}
.pc-exp-num { font-size: 12px; color: #64748b; font-weight: 600; }

/* 奖章 */
.pc-medal {
  flex-shrink: 0; display: flex; flex-direction: column; align-items: center;
  margin-top: 4px;
}
.pc-medal-svg { filter: drop-shadow(0 2px 6px rgba(255,193,7,0.3)); }
.pc-ribbon {
  margin-top: -6px;
  background: linear-gradient(135deg, #FFDD6B, #E8B830);
  color: #6B5020; font-size: 9px; font-weight: 800;
  padding: 2px 10px; border-radius: 8px;
  box-shadow: 0 2px 6px rgba(255,179,0,0.25);
  white-space: nowrap;
}

/* 统计 */
.pc-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid rgba(0,0,0,0.05); padding-top: 10px;
}
.pc-stat { text-align: center; }
.pc-stat-num { display: block; font-size: 26px; font-weight: 900; line-height: 1.1; }
.pc-stat-label { font-size: 11px; color: #8a95a5; font-weight: 500; margin-top: 2px; display: block; }
.pc-num-blue { color: #3B9DD6; }
.pc-num-gold { color: #D4983B; }
.pc-num-green { color: #45A870; }

/* ============================================
   KanaEntry 五十音図入口
   ============================================ */
.kana-entry {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-radius: 18px;
  border: 1.5px solid rgba(129,199,132,0.5);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  cursor: pointer; transition: all .2s;
}
.kana-entry:active { transform: scale(0.98); }
.ke-icon { font-size: 36px; flex-shrink: 0; }
.ke-text { flex: 1; }
.ke-text h3 { font-size: 17px; font-weight: 700; color: #2E7D32; margin: 0 0 2px; }
.ke-text p { font-size: 12px; color: #558B2F; margin: 0; }
.ke-arrow {
  flex-shrink: 0;
  animation: arrowSlide 1.5s ease-in-out infinite;
}
@keyframes arrowSlide { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }

/* ============================================
   LevelCard 关卡卡片
   ============================================ */
.level-card {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 14px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-radius: 18px;
  border: 1.5px solid rgba(255,255,255,0.5);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  cursor: pointer; transition: all .2s;
}
.level-card:active { transform: scale(0.98); }
.lc-locked { opacity: 0.7; cursor: not-allowed; }
.lc-locked:active { transform: none; }

/* 左插画 */
.lc-illust {
  position: relative; width: 60px; height: 60px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(145deg, #EDE7F6, #D1C4E9);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(103,58,183,0.15);
}
.lc-illust-locked { background: linear-gradient(145deg, #ECEFF1, #CFD8DC); }
.lc-controller { font-size: 30px; }
.lc-lock-badge {
  position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.6); color: white;
  font-size: 9px; font-weight: 700; padding: 2px 8px;
  border-radius: 6px; white-space: nowrap;
}

/* 右信息 */
.lc-info { flex: 1; min-width: 0; }
.lc-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.lc-stage-num { font-size: 11px; color: #7a8599; font-weight: 500; }
.lc-arrow { animation: arrowSlide 1.5s ease-in-out infinite; }
.lc-coin-cost {
  display: flex; align-items: center; gap: 3px;
  background: linear-gradient(135deg, #FFF8E1, #FFECB3);
  border: 1px solid #FFD54F; border-radius: 10px;
  padding: 2px 8px; font-size: 11px; font-weight: 700; color: #E65100;
}
.lc-name { font-size: 16px; font-weight: 700; color: #2d3748; margin: 0 0 2px; }
.lc-name-locked { color: #94a3b8; }
.lc-desc { font-size: 11px; color: #64748b; margin: 0 0 6px; line-height: 1.4; }
.lc-desc-locked { color: #a0aab4; }

/* 底行 */
.lc-bottom-row { display: flex; align-items: center; justify-content: space-between; }
.lc-bottom-left { display: flex; align-items: center; gap: 8px; }
.lc-score { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: #78909C; }
.lc-stars { display: flex; gap: 2px; }
.lc-star { font-size: 18px; transition: all .3s; }
.lc-star-on {
  color: #FFB300;
  text-shadow: 0 0 8px rgba(255,179,0,0.5);
  animation: starGlow 2s ease-in-out infinite;
}
.lc-star-off { color: #D1D5DB; }
@keyframes starGlow {
  0%,100% { text-shadow: 0 0 8px rgba(255,179,0,0.3); }
  50% { text-shadow: 0 0 16px rgba(255,179,0,0.7); }
}

/* CTA按钮 */
.lc-btn {
  display: inline-block; padding: 7px 20px; border: none;
  border-radius: 20px; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all .15s; letter-spacing: 0.5px;
  flex-shrink: 0;
}
.lc-btn:active { transform: scale(0.93); }
.lc-btn-replay {
  background: linear-gradient(135deg, #6DD5ED, #2193B0);
  color: white;
  box-shadow: 0 4px 12px rgba(33,147,176,0.3);
}
.lc-btn-start {
  background: linear-gradient(135deg, #A8E063, #56AB2F);
  color: white;
  box-shadow: 0 4px 12px rgba(86,171,47,0.3);
}

/* ============================================
   Empty & Spacer
   ============================================ */
.ss-empty { text-align: center; padding: 50px 20px; color: #94a3b8; }
.ss-empty-icon { font-size: 48px; margin-bottom: 8px; }
.ss-empty h3 { font-size: 18px; font-weight: 700; color: #64748b; margin: 0 0 4px; }
.ss-empty p { font-size: 13px; }
.ss-bottom-spacer { height: 30px; }
</style>
