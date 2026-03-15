<template>
  <!-- 全屏沉浸式主页 -->
  <div class="min-h-screen bg-japanese bg-sakura relative overflow-hidden">
    <!-- 日式装饰背景元素 -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- 富士山轮廓 (纯CSS) -->
      <div class="absolute bottom-0 left-1/4 w-96 h-48 opacity-10">
        <div class="w-full h-full bg-gradient-to-t from-gray-400 to-transparent" 
             style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
      </div>
      <!-- 鸟居装饰 -->
      <div class="absolute top-20 right-10 opacity-5 text-8xl transform rotate-12">⛩️</div>
      <div class="absolute bottom-32 left-10 opacity-5 text-6xl">🏯</div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <!-- 英雄区域 - 全新设计 -->
      <div class="text-center mb-20 pt-16">
        <!-- Logo 区域 - 3D效果 -->
        <div class="inline-flex items-center justify-center w-40 h-40 mb-8 game-card-3d">
          <div class="w-full h-full bg-gradient-to-br from-white via-pink-50 to-blue-50 rounded-full shadow-2xl flex items-center justify-center border-4 border-white relative overflow-hidden">
            <!-- 内部发光效果 -->
            <div class="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-blue-200/30 rounded-full animate-pulse-glow"></div>
            <span class="text-7xl relative z-10 animate-float">🎌</span>
          </div>
        </div>

        <!-- 主标题 - 打字机效果 -->
        <h1 class="text-title-game text-6xl md:text-8xl mb-6 animate-typewriter">
          <span class="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Nihongo Quest
          </span>
        </h1>

        <!-- 副标题 - 渐入动画 -->
        <p class="text-subtitle text-gray-700 mb-8 animate-fade-in-up animate-delay-200 max-w-2xl mx-auto">
          🗾 60天通關 JLPT N5 的遊戲化日語學習平台 🎮
          <br />
          <span class="text-lg text-gray-600 mt-2 block">
            像玩RPG一样学日语，让每个单词都变成经验值！
          </span>
        </p>

        <!-- CTA按钮组 - 发光效果 -->
        <div class="flex flex-col sm:flex-row justify-center items-center gap-6 animate-fade-in-up animate-delay-400">
          <router-link
            to="/auth/register"
            class="game-button text-xl px-12 py-6 animate-pulse-glow text-shadow"
          >
            ⚔️ 开始冒险之旅
          </router-link>
          <router-link
            to="/auth/login"
            class="game-button-secondary text-xl px-12 py-6"
          >
            🎯 继续游戏
          </router-link>
        </div>

        <!-- 统计数据 - 数字跳动 -->
        <div class="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up animate-delay-500">
          <div class="text-center">
            <div class="text-3xl font-bold text-pink-500 count-animation">800+</div>
            <div class="text-sm text-gray-600">单词宝库</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-500 count-animation">82</div>
            <div class="text-sm text-gray-600">语法点</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-500 count-animation">6</div>
            <div class="text-sm text-gray-600">游戏模式</div>
          </div>
        </div>
      </div>

      <!-- 游戏特色 - 3D卡片展示 -->
      <div class="mb-20">
        <h2 class="text-title text-center mb-12 animate-fade-in-up">
          <span class="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
            🎯 为什么选择 Nihongo Quest？
          </span>
        </h2>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- 特色卡片1 - 游戏化学习 -->
          <div class="game-card game-card-3d text-center p-8 group animate-scale-in animate-delay-100 relative overflow-hidden">
            <!-- 背景装饰 -->
            <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-100 to-transparent rounded-bl-full"></div>
            
            <div class="text-6xl mb-6 group-hover:animate-bounce-slow transition-all duration-300">🎮</div>
            <h3 class="text-xl font-bold mb-4 text-gray-800">6种游戏模式</h3>
            <p class="text-gray-600 leading-relaxed">
              消消乐记单词、BOSS战学语法、语音道场练发音、
              <span class="text-pink-500 font-semibold">让学习像玩游戏一样上瘾！</span>
            </p>
            
            <!-- 悬浮发光效果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-pink-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </div>

          <!-- 特色卡片2 - 冒险地图 -->
          <div class="game-card game-card-3d text-center p-8 group animate-scale-in animate-delay-200 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full"></div>
            
            <div class="text-6xl mb-6 group-hover:animate-float transition-all duration-300">🗺️</div>
            <h3 class="text-xl font-bold mb-4 text-gray-800">6大冒险区域</h3>
            <p class="text-gray-600 leading-relaxed">
              从五十音岛到N5试炼塔，
              <span class="text-blue-500 font-semibold">每个区域都是新的挑战与成长！</span>
            </p>
            
            <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </div>

          <!-- 特色卡片3 - 学习系统 -->
          <div class="game-card game-card-3d text-center p-8 group animate-scale-in animate-delay-300 relative overflow-hidden star-sparkle">
            <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full"></div>
            
            <div class="text-6xl mb-6 group-hover:animate-pulse-glow transition-all duration-300">📚</div>
            <h3 class="text-xl font-bold mb-4 text-gray-800">完整学习体系</h3>
            <p class="text-gray-600 leading-relaxed">
              800个单词、82个语法点、92个假名，
              <span class="text-purple-500 font-semibold">科学规划，系统进阶！</span>
            </p>
            
            <div class="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
          </div>
        </div>
      </div>

      <!-- 学习路径 - 横向时间线设计 -->
      <div class="glass-card p-8 mb-20 relative overflow-hidden animate-fade-in-up animate-delay-400">
        <!-- 背景装饰 -->
        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
        
        <h2 class="text-title text-center mb-12">
          <span class="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            🛤️ 60天学习路径
          </span>
        </h2>
        
        <!-- 时间线容器 -->
        <div class="relative">
          <!-- 主时间线 -->
          <div class="glow-path mx-auto mb-8"></div>
          
          <!-- 学习阶段节点 -->
          <div class="grid md:grid-cols-6 gap-4 relative">
            <div 
              v-for="(area, index) in areas" 
              :key="area.id"
              class="flex flex-col items-center group"
              :class="`animate-slide-in-${index % 2 === 0 ? 'left' : 'right'} animate-delay-${(index + 5) * 100}`"
            >
              <!-- 节点圆圈 - 发光效果 -->
              <div class="relative mb-4">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-white to-gray-50 border-4 shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300 group-hover:scale-110"
                     :class="getAreaBorderColor(index)">
                  <span class="text-2xl group-hover:animate-bounce-slow">{{ area.icon }}</span>
                </div>
                <!-- 节点编号 -->
                <div class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r text-white text-xs font-bold flex items-center justify-center"
                     :class="getAreaGradient(index)">
                  {{ index + 1 }}
                </div>
              </div>

              <!-- 阶段信息卡片 -->
              <div class="game-card p-4 w-full max-w-xs text-center group-hover:scale-105 transition-all duration-300 relative">
                <h4 class="font-bold text-gray-800 mb-2">{{ area.name }}</h4>
                <p class="text-sm text-gray-600 mb-2">{{ area.days }}</p>
                <div class="text-xs bg-gray-100 rounded-full px-3 py-1 inline-block"
                     :class="getAreaTextColor(index)">
                  {{ getAreaDescription(area.name) }}
                </div>
                
                <!-- 连接线 -->
                <div v-if="index < areas.length - 1" 
                     class="absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-pink-300 to-blue-300 hidden md:block"></div>
              </div>
            </div>
          </div>

          <!-- 总体进度展示 -->
          <div class="text-center mt-12 animate-fade-in-up animate-delay-600">
            <div class="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <span class="text-sm font-medium text-gray-600">完成度</span>
              <div class="progress-bar w-32">
                <div class="progress-fill" style="width: 0%"></div>
              </div>
              <span class="text-sm font-bold text-pink-500">0/60 天</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 最终CTA区域 - 强调设计 -->
      <div class="text-center wave-decoration relative">
        <div class="glass-card p-12 max-w-4xl mx-auto animate-fade-in-up animate-delay-700">
          <!-- 装饰元素 -->
          <div class="absolute top-4 left-4 text-3xl opacity-20">🌸</div>
          <div class="absolute top-4 right-4 text-3xl opacity-20">⛩️</div>
          <div class="absolute bottom-4 left-1/4 text-2xl opacity-20">🗾</div>
          <div class="absolute bottom-4 right-1/4 text-2xl opacity-20">🎌</div>
          
          <h2 class="text-title mb-6">
            <span class="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎯 准备好开始日语冒险了吗？
            </span>
          </h2>
          
          <p class="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            加入 <span class="font-bold text-pink-500">Nihongo Quest</span>，
            让学习日语变得像玩游戏一样有趣！
            <br />
            <span class="text-lg text-gray-600">
              每天30分钟，60天后你就是N5高手！🏆
            </span>
          </p>

          <!-- 主CTA按钮 -->
          <div class="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <router-link
              to="/auth/register"
              class="game-button text-xl px-16 py-6 animate-pulse-glow relative overflow-hidden group"
            >
              <!-- 按钮特效 -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              🎌 立即开始冒险
            </router-link>
            
            <div class="text-gray-500 px-4">或</div>
            
            <router-link
              to="/auth/login"
              class="game-button-secondary text-lg px-8 py-4"
            >
              📱 先试玩体验
            </router-link>
          </div>

          <!-- 额外信息 -->
          <div class="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <span class="text-green-500">✅</span>
              <span>完全免费</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-blue-500">📱</span>
              <span>支持手机</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-purple-500">🎯</span>
              <span>专业认证</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-pink-500">🎮</span>
              <span>游戏化学习</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页面底部装饰 -->
    <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-pink-50/50 to-transparent pointer-events-none"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// 学习区域数据 - 重新设计
const areas = [
  {
    id: 1,
    name: '五十音岛',
    icon: '🏝️',
    days: 'Day 1-7',
    color: 'pink'
  },
  {
    id: 2,
    name: '单词村',
    icon: '🏘️',
    days: 'Day 8-21',
    color: 'blue'
  },
  {
    id: 3,
    name: '语法城',
    icon: '🏯',
    days: 'Day 22-35',
    color: 'purple'
  },
  {
    id: 4,
    name: '会话广场',
    icon: '🎪',
    days: 'Day 36-45',
    color: 'green'
  },
  {
    id: 5,
    name: '读解森林',
    icon: '🌲',
    days: 'Day 46-53',
    color: 'orange'
  },
  {
    id: 6,
    name: 'N5试炼塔',
    icon: '🏆',
    days: 'Day 54-60',
    color: 'red'
  }
]

// 获取区域边框颜色
const getAreaBorderColor = (index) => {
  const colors = [
    'border-pink-400',
    'border-blue-400', 
    'border-purple-400',
    'border-green-400',
    'border-orange-400',
    'border-red-400'
  ]
  return colors[index % colors.length]
}

// 获取区域渐变色
const getAreaGradient = (index) => {
  const gradients = [
    'from-pink-500 to-pink-600',
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-red-500 to-red-600'
  ]
  return gradients[index % gradients.length]
}

// 获取区域文字颜色
const getAreaTextColor = (index) => {
  const colors = [
    'text-pink-600',
    'text-blue-600',
    'text-purple-600', 
    'text-green-600',
    'text-orange-600',
    'text-red-600'
  ]
  return colors[index % colors.length]
}

// 获取区域描述
const getAreaDescription = (name) => {
  const descriptions = {
    '五十音岛': '基础发音',
    '单词村': '词汇积累',
    '语法城': '语法规则',
    '会话广场': '口语练习',
    '读解森林': '阅读理解',
    'N5试炼塔': '综合测试'
  }
  return descriptions[name] || '学习内容'
}

// 页面挂载时的动画处理
onMounted(() => {
  // 可以在这里添加一些页面加载后的特殊动画
  console.log('🎌 Nihongo Quest 首页已加载')
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