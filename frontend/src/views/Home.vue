<template>
  <div class="landing-v2">
    <!-- 全屏背景 -->
    <img src="/assets/landing-v2/bg-landing.png" class="bg" alt="" />
    <!-- 背景暗化遮罩 — 下半部分渐变 -->
    <div class="bg-overlay"></div>

    <!-- 樱花粒子层 -->
    <div class="sakura-layer">
      <span v-for="i in 10" :key="i" class="petal" :style="petalStyle(i)">🌸</span>
    </div>

    <!-- 内容层 -->
    <div class="content">
      <!-- 顶部留白 -->
      <div class="spacer-top"></div>

      <!-- Logo区：吉祥物 + 标题 -->
      <div class="logo-section">
        <img src="/assets/landing-v2/component-mascot.png" class="mascot" alt="龙虾武士" />
        <img src="/assets/landing-v2/component-title.png" class="title-img" alt="日語冒險" />
        <img src="/assets/landing-v2/component-banner.png" class="banner-img" alt="Nihongo Quest" />
      </div>

      <!-- 标语 -->
      <div class="slogan-section">
        <img src="/assets/landing-v2/component-slogan.png" class="slogan-img" alt="60天掌握日语N5" />
      </div>

      <!-- 特色卡片 -->
      <div class="cards-section">
        <img src="/assets/landing-v2/component-cards.png" class="cards-img" alt="特色功能" />
      </div>

      <!-- CTA —— 最重要的元素 -->
      <div class="cta-section">
        <div class="cta-btn" @click="startAdventure">
          <span>🎮 开始冒险</span>
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
    opacity: 0.4 + Math.random() * 0.3,
  }
}
</script>

<style scoped>
.landing-v2 {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0d0520;
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

/* 暗化遮罩 — 从40%开始加深 */
.bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to bottom,
    rgba(13, 5, 32, 0) 0%,
    rgba(13, 5, 32, 0.15) 25%,
    rgba(13, 5, 32, 0.6) 45%,
    rgba(13, 5, 32, 0.88) 65%,
    rgba(13, 5, 32, 0.95) 100%
  );
}

/* 樱花 */
.sakura-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
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

/* 内容层 */
.content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding-bottom: 5vh;
  gap: 2.5vh;
}

.spacer-top {
  flex: 0.6;
}

/* Logo区 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5vh;
  position: relative;
}

.mascot {
  width: 22vw;
  max-width: 110px;
  height: auto;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.5));
  animation: mascotFloat 3s ease-in-out infinite;
}
@keyframes mascotFloat {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-6px) rotate(2deg); }
}

.title-img {
  width: 58vw;
  max-width: 280px;
  height: auto;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.6));
}

.banner-img {
  width: 42vw;
  max-width: 200px;
  height: auto;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
  margin-top: -0.5vh;
}

/* 标语 */
.slogan-img {
  width: 62vw;
  max-width: 300px;
  height: auto;
  filter: drop-shadow(0 2px 10px rgba(0,0,0,0.5));
}

/* 卡片 */
.cards-img {
  width: 82vw;
  max-width: 380px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
}

/* CTA —— 最大最亮 */
.cta-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2vh;
}

.cta-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24, #ff4757);
  color: white;
  font-size: 20px;
  font-weight: 800;
  padding: 14px 60px;
  border-radius: 50px;
  border: 3px solid rgba(255,255,255,0.4);
  box-shadow:
    0 6px 24px rgba(255,75,43,0.5),
    0 2px 8px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 3px;
  animation: ctaGlow 2s ease-in-out infinite;
}
.cta-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(255,75,43,0.7), 0 2px 8px rgba(0,0,0,0.3);
}
.cta-btn:active {
  transform: scale(0.95);
}
@keyframes ctaGlow {
  0%, 100% { box-shadow: 0 6px 24px rgba(255,75,43,0.5), 0 2px 8px rgba(0,0,0,0.3); }
  50% { box-shadow: 0 8px 36px rgba(255,75,43,0.7), 0 4px 12px rgba(0,0,0,0.4); }
}

.login-link {
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: color 0.2s;
}
.login-link:hover { color: rgba(255,255,255,0.8); }

/* iPad */
@media (min-width: 768px) {
  .mascot { max-width: 140px; }
  .title-img { max-width: 360px; }
  .banner-img { max-width: 260px; }
  .slogan-img { max-width: 380px; }
  .cards-img { max-width: 500px; }
  .cta-btn { font-size: 24px; padding: 16px 72px; }
}
</style>
