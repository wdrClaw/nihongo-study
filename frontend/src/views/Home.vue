<template>
  <!-- 移动端全屏引导页 - iPhone 13 Pro Max 优化 -->
  <div class="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary relative overflow-hidden flex flex-col">
    
    <!-- 樱花飘落装饰 -->
    <div class="bg-sakura absolute inset-0 pointer-events-none z-0"></div>
    
    <!-- 顶部 1/3：Logo + 标题 + 副标题 -->
    <div class="flex-1 flex items-center justify-center px-5 pt-16 pb-8 relative z-10">
      <div class="text-center w-full max-w-sm">
        <!-- Logo 区域 - 移动端优化 -->
        <div class="inline-flex items-center justify-center w-24 h-24 mb-6">
          <div class="w-full h-full bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-primary-100 relative">
            <span class="text-5xl animate-float">🌸</span>
          </div>
        </div>

        <!-- 主标题 - 移动端字号 -->
        <h1 class="text-3xl font-bold mb-4 tracking-wide">
          <span class="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
            Nihongo Quest
          </span>
        </h1>

        <!-- 副标题 - 简洁版 -->
        <p class="text-base text-text-secondary mb-6 leading-relaxed">
          60天通关 JLPT N5 🎯
          <br />
          <span class="text-sm text-text-light mt-1 block">
            像玩RPG一样学日语！
          </span>
        </p>

        <!-- 统计数据 - 移动端布局 -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-400">800+</div>
            <div class="text-xs text-text-secondary">单词</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-secondary-500">82</div>
            <div class="text-xs text-text-secondary">语法</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-accent-500">6</div>
            <div class="text-xs text-text-secondary">游戏</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间：3个特性卡片 - 竖排布局（移动端最佳） -->
    <div class="flex-1 px-5 pb-8 relative z-10">
      <div class="w-full max-w-sm mx-auto space-y-4">
        
        <!-- 特色卡片1 - 游戏化学习 -->
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-primary-100 relative overflow-hidden">
          <div class="flex items-center space-x-4">
            <div class="text-4xl">🎮</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-text-primary mb-1">6种游戏模式</h3>
              <p class="text-sm text-text-secondary">消消乐记单词、语法战斗、语音练习</p>
            </div>
          </div>
        </div>

        <!-- 特色卡片2 - 冒险地图 -->
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-secondary-100 relative overflow-hidden">
          <div class="flex items-center space-x-4">
            <div class="text-4xl">🗺️</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-text-primary mb-1">6大冒险区域</h3>
              <p class="text-sm text-text-secondary">从五十音岛到N5试炼塔的完整路径</p>
            </div>
          </div>
        </div>

        <!-- 特色卡片3 - 学习系统 -->
        <div class="bg-white rounded-2xl p-6 shadow-lg border border-accent-100 relative overflow-hidden">
          <div class="flex items-center space-x-4">
            <div class="text-4xl">📚</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-text-primary mb-1">完整学习体系</h3>
              <p class="text-sm text-text-secondary">800个单词、82个语法点，科学规划</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- 底部：CTA 按钮 - 全宽大按钮 -->
    <div class="px-5 pb-8 relative z-10">
      <div class="w-full max-w-sm mx-auto space-y-4">
        <!-- 主CTA按钮 -->
        <router-link
          to="/auth/register"
          class="w-full h-[52px] bg-gradient-to-r from-primary-400 to-primary-500 text-white text-base font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center touch-target hover:from-primary-500 hover:to-primary-600 hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
        >
          <span class="flex items-center">
            开始日语冒险 
            <span class="ml-2">🚀</span>
          </span>
        </router-link>
        
        <!-- 次要按钮 -->
        <router-link
          to="/auth/login"
          class="w-full h-[48px] bg-white text-primary-400 text-base font-semibold rounded-xl border-2 border-primary-200 transition-all duration-300 flex items-center justify-center touch-target hover:bg-primary-50 hover:border-primary-300"
        >
          <span class="flex items-center">
            已有账号登入
            <span class="ml-2">🎮</span>
          </span>
        </router-link>
        
        <!-- 额外信息 -->
        <div class="flex justify-center items-center space-x-6 text-xs text-text-secondary mt-6">
          <div class="flex items-center space-x-1">
            <span class="text-success">✅</span>
            <span>免费使用</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="text-primary-400">📱</span>
            <span>手机适配</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="text-accent-500">🎯</span>
            <span>专业认证</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// 页面挂载时的处理
onMounted(() => {
  console.log('🎌 Nihongo Quest 首页已加载 - 移动端优化版')
})
</script>

<style scoped>
/* 页面特有样式 */
.count-animation {
  animation: countUp 2s ease-out forwards;
}

@keyframes countUp {
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.8); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

/* 文字阴影效果 */
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 鼠标悬浮时的音效提示（可选） */
.interactive:hover {
  /* 这里可以添加音效触发 */
}
</style>