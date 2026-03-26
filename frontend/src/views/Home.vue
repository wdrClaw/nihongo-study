<template>
  <div class="landing-v2" @click="handleClick">
    <!-- 背景图 -->
    <img src="/assets/landing-v2/bg-landing.png" class="bg" alt="" />

    <!-- 樱花粒子 -->
    <div class="sakura-layer">
      <span v-for="i in 10" :key="i" class="petal" :style="petalStyle(i)">🌸</span>
    </div>

    <!-- 组件层 — 按 GPT 布局规格绝对定位 -->
    <div class="components">
      <!-- 标题 700×220 @ (162, 92) -->
      <img src="/assets/landing-v2/component-title.png"
        class="comp comp-title" alt="日語冒險" />

      <!-- 横幅 560×140 @ (232, 320) -->
      <img src="/assets/landing-v2/component-banner.png"
        class="comp comp-banner" alt="Nihongo Quest" />

      <!-- 吉祥物 420×420 @ (302, 470) -->
      <img src="/assets/landing-v2/component-mascot.png"
        class="comp comp-mascot" alt="龙虾武士" />

      <!-- 标语 620×120 @ (202, 915) -->
      <img src="/assets/landing-v2/component-slogan.png"
        class="comp comp-slogan" alt="60天掌握日语N5" />

      <!-- 卡片 860×300 @ (82, 1060) -->
      <img src="/assets/landing-v2/component-cards.png"
        class="comp comp-cards" alt="特色功能" />

      <!-- CTA 420×128 @ (302, 1380) -->
      <div class="comp comp-cta" @click.stop="startAdventure">
        <img src="/assets/landing-v2/component-cta.png" class="cta-img" alt="开始冒险" />
      </div>

      <!-- 登录链接 -->
      <p class="login-link" @click.stop="goLogin">— 已有账号？登录 —</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const startAdventure = () => router.push('/login')
const goLogin = () => router.push('/login')
const handleClick = () => {} // prevent bubbling

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
    opacity: 0.4 + Math.random() * 0.3,
  }
}
</script>

<style scoped>
/*
 * 布局基于 GPT 设计稿: 1024×1536 画布
 * 使用 vw 单位按比例缩放到实际屏幕
 * 设计稿中 1024px = 100vw
 * 比例因子: vw / 1024 = 0.09765625
 * 垂直: 使用 vh，1536px = 100vh
 * 比例因子: vh / 1536 = 0.06510417
 */

.landing-v2 {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0d0520;
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

/* 樱花 */
.sakura-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
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
  10% { opacity: 0.8; }
  90% { opacity: 0.3; }
  100% { transform: translateY(100vh) rotate(720deg) translateX(60px); opacity: 0; }
}

/* 组件容器 — 保持设计稿比例 */
.components {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  height: 100vh;
  z-index: 5;
}

/* 通用组件样式 */
.comp {
  position: absolute;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
}

/* 标题: (162, 92) 700×220 → 比例: left:15.82%, top:5.99%, w:68.36%, h:14.32% */
.comp-title {
  left: 15.82%;
  top: 5.99%;
  width: 68.36%;
  height: auto;
}

/* 横幅: (232, 320) 560×140 → left:22.66%, top:20.83%, w:54.69% */
.comp-banner {
  left: 22.66%;
  top: 20.83%;
  width: 54.69%;
  height: auto;
}

/* 吉祥物: (302, 470) 420×420 → left:29.49%, top:30.60%, w:41.02% */
.comp-mascot {
  left: 29.49%;
  top: 30.60%;
  width: 41.02%;
  height: auto;
  animation: mascotFloat 3s ease-in-out infinite;
}
@keyframes mascotFloat {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-6px) rotate(1deg); }
}

/* 标语: (202, 915) 620×120 → left:19.73%, top:59.57%, w:60.55% */
.comp-slogan {
  left: 19.73%;
  top: 59.57%;
  width: 60.55%;
  height: auto;
}

/* 卡片: (82, 1060) 860×300 → left:8.01%, top:69.01%, w:83.98% */
.comp-cards {
  left: 8.01%;
  top: 69.01%;
  width: 83.98%;
  height: auto;
}

/* CTA: (302, 1380) 420×128 → left:29.49%, top:89.84%, w:41.02% */
.comp-cta {
  left: 29.49%;
  top: 89.84%;
  width: 41.02%;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.comp-cta:hover { transform: scale(1.05); }
.comp-cta:active { transform: scale(0.95); }
.cta-img {
  width: 100%;
  height: auto;
  animation: ctaPulse 2s ease-in-out infinite;
}
@keyframes ctaPulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 4px 16px rgba(255,50,50,0.4)); }
  50% { transform: scale(1.03); filter: drop-shadow(0 6px 24px rgba(255,50,50,0.6)); }
}

/* 登录链接 → CTA 下方 */
.login-link {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 96%;
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  cursor: pointer;
  letter-spacing: 1px;
  white-space: nowrap;
}
.login-link:hover { color: rgba(255,255,255,0.8); }
</style>
