<template>
  <div class="landing-v2">
    <!-- 全屏背景 -->
    <img src="/assets/landing-v2/bg-landing.png" class="bg" alt="" />

    <!-- 樱花粒子层 -->
    <div class="sakura-layer">
      <span v-for="i in 12" :key="i" class="petal" :style="petalStyle(i)">🌸</span>
    </div>

    <!-- 内容层 -->
    <div class="content">
      <!-- 顶部：标题+吉祥物同行 -->
      <div class="header-row">
        <div class="header-left">
          <img src="/assets/landing-v2/component-title.png" class="title-img" alt="日語冒險" />
          <img src="/assets/landing-v2/component-banner.png" class="banner-img" alt="Nihongo Quest" />
        </div>
        <img src="/assets/landing-v2/component-mascot.png" class="mascot" alt="龙虾武士" />
      </div>

      <!-- 标语 -->
      <div class="slogan-area">
        <img src="/assets/landing-v2/component-slogan.png" class="slogan-img" alt="60天掌握日语N5" />
      </div>

      <!-- 特色卡片 -->
      <div class="cards-area">
        <img src="/assets/landing-v2/component-cards.png" class="cards-img" alt="特色功能" />
      </div>

      <!-- CTA按钮 -->
      <div class="cta-section">
        <div class="cta-area" @click="startAdventure">
          <img src="/assets/landing-v2/component-cta.png" class="cta-img" alt="开始冒险" />
        </div>
        <p class="login-link" @click="goLogin">— 已有账号？登录 —</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const startAdventure = () => router.push('/login')
const goLogin = () => router.push('/login')

const petalStyle = (i) => {
  const left = Math.random() * 100
  const delay = Math.random() * 8
  const duration = 6 + Math.random() * 6
  const size = 14 + Math.random() * 10
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    fontSize: `${size}px`,
    opacity: 0.5 + Math.random() * 0.4,
  }
}
</script>

<style scoped>
.landing-v2 {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #1a0a2e;
}

.bg {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  width: auto;
  min-width: 100%;
  object-fit: cover;
  z-index: 0;
}

/* 樱花粒子 */
.sakura-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}
.petal {
  position: absolute;
  top: -30px;
  animation: sakuraFall linear infinite;
}
@keyframes sakuraFall {
  0% { transform: translateY(-30px) rotate(0deg) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 0.6; }
  100% { transform: translateY(100vh) rotate(720deg) translateX(80px); opacity: 0; }
}

/* 内容层 */
.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 4vh 4vw 3vh;
}

/* 顶部：标题+吉祥物同一行 */
.header-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2vw;
  width: 100%;
}
.header-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5vh;
}
.title-img {
  width: 55vw;
  max-width: 280px;
  height: auto;
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.4));
}
.banner-img {
  width: 45vw;
  max-width: 220px;
  height: auto;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
}
.mascot {
  width: 28vw;
  max-width: 140px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
  animation: mascotBounce 3s ease-in-out infinite;
}
@keyframes mascotBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* 标语 */
.slogan-img {
  width: 70vw;
  max-width: 320px;
  height: auto;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
}

/* 特色卡片 */
.cards-img {
  width: 88vw;
  max-width: 400px;
  height: auto;
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.3));
}

/* CTA区域 */
.cta-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vh;
}
.cta-area {
  cursor: pointer;
  transition: transform 0.2s ease;
}
.cta-area:hover { transform: scale(1.05); }
.cta-area:active { transform: scale(0.95); }
.cta-img {
  width: 55vw;
  max-width: 260px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(255,100,100,0.5));
  animation: ctaPulse 2s ease-in-out infinite;
}
@keyframes ctaPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
.login-link {
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 1px;
}
.login-link:hover { color: #fff; }

/* iPad 8寸 */
@media (min-width: 768px) {
  .title-img { max-width: 360px; }
  .banner-img { max-width: 280px; }
  .mascot { max-width: 180px; }
  .slogan-img { max-width: 400px; }
  .cards-img { max-width: 520px; }
  .cta-img { max-width: 300px; }
}
</style>
