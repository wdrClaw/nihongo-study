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
      <!-- 吉祥物 -->
      <div class="mascot-area">
        <img src="/assets/landing-v2/component-mascot.png" class="mascot" alt="龙虾武士" />
      </div>

      <!-- 标题 -->
      <div class="title-area">
        <img src="/assets/landing-v2/component-title.png" class="title-img" alt="日語冒險" />
      </div>

      <!-- 副标题横幅 -->
      <div class="banner-area">
        <img src="/assets/landing-v2/component-banner.png" class="banner-img" alt="Nihongo Quest" />
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
      <div class="cta-area" @click="startAdventure">
        <img src="/assets/landing-v2/component-cta.png" class="cta-img" alt="开始冒险" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const startAdventure = () => {
  router.push('/login')
}

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
  overflow-y: auto;
  overflow-x: hidden;
  background: #1a0a2e;
}

/* 背景图 */
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  0% {
    transform: translateY(-30px) rotate(0deg) translateX(0px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(100vh) rotate(720deg) translateX(80px);
    opacity: 0;
  }
}

/* 内容层 */
.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  padding: 2vh 0 4vh;
  gap: 1vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 吉祥物 */
.mascot-area {
  flex-shrink: 0;
}

.mascot {
  width: 28vw;
  max-width: 150px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));

  animation: mascotBounce 3s ease-in-out infinite;
}

@keyframes mascotBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* 标题 */
.title-area {
  flex-shrink: 0;
}

.title-img {
  width: 65vw;
  max-width: 320px;
  height: auto;
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.4));

}

/* 副标题横幅 */
.banner-area {
  flex-shrink: 0;
}

.banner-img {
  width: 65vw;
  max-width: 300px;
  height: auto;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));

}

/* 标语 */
.slogan-area {
  flex-shrink: 0;
}

.slogan-img {
  width: 60vw;
  max-width: 280px;
  height: auto;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));

}

/* 特色卡片 */
.cards-area {
  flex-shrink: 0;
}

.cards-img {
  width: 80vw;
  max-width: 360px;
  height: auto;
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.3));

}

/* CTA按钮 */
.cta-area {
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.cta-area:hover {
  transform: scale(1.05);
}

.cta-area:active {
  transform: scale(0.95);
}

.cta-img {
  width: 45vw;
  max-width: 200px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(255,50,50,0.4));

  animation: ctaPulse 2s ease-in-out infinite;
}

@keyframes ctaPulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 4px 12px rgba(255,50,50,0.4)); }
  50% { transform: scale(1.03); filter: drop-shadow(0 6px 16px rgba(255,50,50,0.6)); }
}

/* iPad 8寸触控优先 */
@media (min-width: 768px) {
  .mascot { max-width: 220px; }
  .title-img { max-width: 420px; }
  .banner-img { max-width: 360px; }
  .slogan-img { max-width: 340px; }
  .cards-img { max-width: 480px; }
  .cta-img { max-width: 280px; }
  .content { gap: 2vh; }
}
</style>
