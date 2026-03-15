<template>
  <div class="world-map min-h-screen relative overflow-hidden bg-game-world">
    
    <!-- 多层视差背景系统 -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- 远山层 - 最慢移动 -->
      <div class="parallax-layer parallax-far absolute inset-0">
        <!-- 远山轮廓 (纯CSS) -->
        <div class="absolute bottom-0 left-0 w-full h-64 opacity-20">
          <div class="w-full h-full bg-gradient-to-t from-blue-300 to-transparent"
               style="clip-path: polygon(0% 100%, 15% 60%, 30% 70%, 45% 40%, 60% 65%, 75% 35%, 90% 55%, 100% 100%);"></div>
        </div>
        <div class="absolute bottom-0 left-1/4 w-3/4 h-48 opacity-15">
          <div class="w-full h-full bg-gradient-to-t from-purple-300 to-transparent"
               style="clip-path: polygon(0% 100%, 20% 80%, 40% 30%, 60% 70%, 80% 20%, 100% 100%);"></div>
        </div>
      </div>

      <!-- 中景层 - 中等速度 -->
      <div class="parallax-layer parallax-mid absolute inset-0">
        <!-- 浮动的云朵 -->
        <div v-for="i in 8" :key="'cloud-' + i"
             class="absolute text-white/40 animate-cloud-float"
             :style="{
               left: Math.random() * 90 + '%',
               top: Math.random() * 50 + '%',
               fontSize: (Math.random() * 1.5 + 1.5) + 'rem',
               animationDelay: Math.random() * 10 + 's',
               animationDuration: (Math.random() * 5 + 8) + 's'
             }">
          ☁️
        </div>
        
        <!-- 远处的树木剪影 -->
        <div class="absolute bottom-20 left-10 w-16 h-32 opacity-10">
          <div class="w-full h-full bg-gradient-to-t from-green-400 to-transparent"
               style="clip-path: polygon(45% 0%, 55% 0%, 70% 50%, 80% 100%, 20% 100%, 30% 50%);"></div>
        </div>
        <div class="absolute bottom-20 right-20 w-20 h-40 opacity-10">
          <div class="w-full h-full bg-gradient-to-t from-green-500 to-transparent"
               style="clip-path: polygon(40% 0%, 60% 0%, 75% 40%, 85% 100%, 15% 100%, 25% 40%);"></div>
        </div>
      </div>

      <!-- 近景层 - 装饰元素 -->
      <div class="parallax-layer parallax-near absolute inset-0">
        <!-- 飘落的樱花瓣 -->
        <div v-for="i in 12" :key="'sakura-' + i"
             class="absolute text-pink-300/50 animate-sakura-fall pointer-events-none"
             :style="{
               left: Math.random() * 100 + '%',
               animationDelay: Math.random() * 8 + 's',
               animationDuration: (Math.random() * 4 + 6) + 's',
               fontSize: '0.8rem'
             }">
          🌸
        </div>
        
        <!-- 日式装饰 -->
        <div class="absolute top-10 right-10 opacity-5 text-6xl animate-float">⛩️</div>
        <div class="absolute top-32 left-20 opacity-5 text-5xl animate-pulse-slow">🏯</div>
        <div class="absolute bottom-40 right-1/3 opacity-5 text-4xl animate-bounce-slow">🎋</div>
      </div>
    </div>

    <!-- 顶部状态栏 - 玻璃拟态效果 -->
    <div class="relative z-20 glass-card border-b border-white/30 shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          
          <!-- 游戏标题 - 发光效果 -->
          <div class="flex items-center space-x-3">
            <div class="text-3xl animate-pulse-glow">🎌</div>
            <div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                Nihongo Quest
              </h1>
              <p class="text-sm text-gray-700">日语冒险之旅</p>
            </div>
          </div>

          <!-- 用户信息 - 升级版 -->
          <div class="flex items-center space-x-6">
            
            <!-- 用户头像和等级 - 3D效果 -->
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="w-14 h-14 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative overflow-hidden">
                  <!-- 发光边框 -->
                  <div class="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
                  <span class="relative z-10">{{ authStore.userNickname?.charAt(0) || '冒' }}</span>
                </div>
                <!-- 等级徽章 -->
                <div class="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {{ authStore.userLevel }}
                </div>
              </div>
              <div>
                <p class="font-bold text-gray-800">{{ authStore.userNickname }}</p>
                <div class="flex items-center space-x-2">
                  <span class="text-sm bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">
                    {{ authStore.levelTitle }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 经验值条 - 发光进度条 -->
            <div class="hidden md:block w-32">
              <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span class="font-medium">EXP</span>
                <span class="font-bold count-up">{{ authStore.levelProgress.toFixed(0) }}%</span>
              </div>
              <div class="progress-bar bg-gray-200/50">
                <div class="progress-fill bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 transition-all duration-700"
                     :style="{ width: authStore.levelProgress + '%' }">
                </div>
              </div>
            </div>

            <!-- 金币 - 闪烁效果 -->
            <div class="flex items-center space-x-2 game-card px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
              <span class="text-2xl animate-bounce-slow">💰</span>
              <span class="text-xl font-bold text-yellow-600 count-up">
                {{ authStore.userCoins.toLocaleString() }}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- 地圖主體 -->
    <div class="relative z-10 max-w-6xl mx-auto px-4 py-8">
      
      <!-- 学习进度概览 - 游戏化仪表盘 -->
      <div class="glass-card p-6 mb-8 border border-white/30 relative overflow-hidden">
        <!-- 背景装饰 -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-bl-full"></div>
        <div class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-100/30 to-transparent rounded-tr-full"></div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
          <!-- 总星星数 -->
          <div class="stats-card group">
            <div class="stats-icon text-4xl mb-2 group-hover:animate-bounce-slow">⭐</div>
            <div class="text-3xl font-bold text-blue-600 mb-1 count-up animate-scale-in">
              {{ gameStore.totalStars }}
            </div>
            <div class="text-sm text-gray-600 font-medium">总星星数</div>
            <div class="stats-glow bg-blue-500"></div>
          </div>
          
          <!-- 完成关卡 -->
          <div class="stats-card group">
            <div class="stats-icon text-4xl mb-2 group-hover:animate-pulse-glow">🎯</div>
            <div class="text-3xl font-bold text-green-600 mb-1 count-up animate-scale-in animate-delay-100">
              {{ gameStore.completedStages }}
            </div>
            <div class="text-sm text-gray-600 font-medium">完成关卡</div>
            <div class="stats-glow bg-green-500"></div>
          </div>
          
          <!-- 掌握单词 -->
          <div class="stats-card group">
            <div class="stats-icon text-4xl mb-2 group-hover:animate-float">📚</div>
            <div class="text-3xl font-bold text-yellow-600 mb-1 count-up animate-scale-in animate-delay-200">
              {{ gameStore.masteredWords }}
            </div>
            <div class="text-sm text-gray-600 font-medium">掌握单词</div>
            <div class="stats-glow bg-yellow-500"></div>
          </div>
          
          <!-- 连续学习 -->
          <div class="stats-card group">
            <div class="stats-icon text-4xl mb-2 group-hover:animate-bounce-slow">🔥</div>
            <div class="text-3xl font-bold text-purple-600 mb-1 count-up animate-scale-in animate-delay-300">
              {{ authStore.user?.consecutive_days || 0 }}
            </div>
            <div class="text-sm text-gray-600 font-medium">连续学习</div>
            <div class="stats-glow bg-purple-500"></div>
          </div>
        </div>
      </div>

      <!-- 地圖路徑 -->
      <div class="map-path relative">
        
        <!-- 发光连接路径 -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 1;">
          <defs>
            <!-- 渐变色定义 -->
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:0.8" />
              <stop offset="50%" style="stop-color:#C084FC;stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:#60A5FA;stop-opacity:0.8" />
            </linearGradient>
            
            <!-- 发光滤镜 -->
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <!-- 脉冲动画渐变 -->
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:transparent;stop-opacity:0">
                <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
              </stop>
              <stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:0.8">
                <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s"/>
              </stop>
              <stop offset="100%" style="stop-color:transparent;stop-opacity:0">
                <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s"/>
              </stop>
            </linearGradient>
          </defs>
          
          <!-- 基础路径 -->
          <path d="M 300 650 Q 350 600 400 550" stroke="url(#pathGradient)" stroke-width="6" fill="none" filter="url(#glow)"/>
          <path d="M 400 550 Q 450 500 500 450" stroke="url(#pathGradient)" stroke-width="6" fill="none" filter="url(#glow)"/>
          <path d="M 500 450 Q 550 400 600 350" stroke="url(#pathGradient)" stroke-width="6" fill="none" filter="url(#glow)"/>
          <path d="M 600 350 Q 650 300 700 250" stroke="url(#pathGradient)" stroke-width="6" fill="none" filter="url(#glow)"/>
          <path d="M 700 250 Q 750 200 800 150" stroke="url(#pathGradient)" stroke-width="6" fill="none" filter="url(#glow)"/>
          
          <!-- 脉冲路径 - 在基础路径上添加动态效果 -->
          <path d="M 300 650 Q 350 600 400 550" stroke="url(#pulseGradient)" stroke-width="3" fill="none"/>
          <path d="M 400 550 Q 450 500 500 450" stroke="url(#pulseGradient)" stroke-width="3" fill="none"/>
          <path d="M 500 450 Q 550 400 600 350" stroke="url(#pulseGradient)" stroke-width="3" fill="none"/>
          <path d="M 600 350 Q 650 300 700 250" stroke="url(#pulseGradient)" stroke-width="3" fill="none"/>
          <path d="M 700 250 Q 750 200 800 150" stroke="url(#pulseGradient)" stroke-width="3" fill="none"/>
          
          <!-- 路径节点光点 -->
          <g class="path-nodes">
            <circle cx="300" cy="650" r="4" fill="#FF6B9D" opacity="0.8">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="400" cy="550" r="4" fill="#C084FC" opacity="0.8">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin="0.4s"/>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.4s"/>
            </circle>
            <circle cx="500" cy="450" r="4" fill="#60A5FA" opacity="0.8">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin="0.8s"/>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.8s"/>
            </circle>
            <circle cx="600" cy="350" r="4" fill="#34D399" opacity="0.8">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin="1.2s"/>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="1.2s"/>
            </circle>
            <circle cx="700" cy="250" r="4" fill="#FBBF24" opacity="0.8">
              <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin="1.6s"/>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="1.6s"/>
            </circle>
          </g>
        </svg>

        <!-- 區域節點 -->
        <div class="areas-container relative" style="height: 800px; z-index: 2;">
          
          <!-- 五十音岛 (起点) -->
          <div class="area-node game-area-node" :class="{ unlocked: isAreaUnlocked(1), current: currentArea === 1 }"
               style="position: absolute; left: 50px; bottom: 80px;"
               @click="selectArea(1)">
            <div class="area-card game-area-card relative overflow-hidden">
              <!-- 背景装饰 -->
              <div class="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-bl-full"></div>
              
              <div class="area-icon text-6xl mb-3 group-hover:animate-bounce-slow transition-all duration-300">🏝️</div>
              <h3 class="area-title">五十音岛</h3>
              <p class="area-subtitle">Day 1-7</p>
              
              <!-- 进度显示 -->
              <div class="area-progress mt-3">
                <div class="stars-display flex items-center justify-center gap-1 mb-2">
                  <span class="text-yellow-500">⭐</span>
                  <span class="font-bold text-gray-700">{{ getAreaStars(1) }}/21</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill animate-progress" :style="{ width: (getAreaStars(1) / 21 * 100) + '%' }"></div>
                </div>
              </div>
              
              <!-- 区域状态指示器 -->
              <div class="area-status mt-2">
                <div v-if="isAreaUnlocked(1)" class="text-xs text-green-600 font-medium">✅ 已解锁</div>
                <div v-else class="text-xs text-gray-400">🔒 未解锁</div>
              </div>
              
              <!-- 悬浮发光效果 -->
              <div class="area-glow"></div>
            </div>
          </div>

          <!-- 单词村 -->
          <div class="area-node game-area-node" :class="{ unlocked: isAreaUnlocked(2), current: currentArea === 2 }"
               style="position: absolute; left: 200px; bottom: 300px;"
               @click="selectArea(2)">
            <div class="area-card game-area-card relative overflow-hidden">
              <div class="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-green-200/30 to-transparent rounded-bl-full"></div>
              
              <div class="area-icon text-6xl mb-3 group-hover:animate-pulse-glow transition-all duration-300">🏘️</div>
              <h3 class="area-title">单词村</h3>
              <p class="area-subtitle">Day 8-21</p>
              
              <div class="area-progress mt-3">
                <div class="stars-display flex items-center justify-center gap-1 mb-2">
                  <span class="text-yellow-500">⭐</span>
                  <span class="font-bold text-gray-700">{{ getAreaStars(2) }}/15</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill animate-progress" :style="{ width: (getAreaStars(2) / 15 * 100) + '%' }"></div>
                </div>
              </div>
              
              <div class="area-status mt-2">
                <div v-if="isAreaUnlocked(2)" class="text-xs text-green-600 font-medium">✅ 已解锁</div>
                <div v-else class="text-xs text-gray-400">🔒 需要完成五十音岛</div>
              </div>
              
              <div class="area-glow"></div>
            </div>
          </div>

          <!-- 语法城 -->
          <div class="area-node game-area-node" :class="{ unlocked: isAreaUnlocked(3), current: currentArea === 3 }"
               style="position: absolute; left: 350px; bottom: 500px;"
               @click="selectArea(3)">
            <div class="area-card game-area-card relative overflow-hidden">
              <div class="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-bl-full"></div>
              
              <div class="area-icon text-6xl mb-3 group-hover:animate-float transition-all duration-300">🏯</div>
              <h3 class="area-title">语法城</h3>
              <p class="area-subtitle">Day 22-35</p>
              
              <div class="area-progress mt-3">
                <div class="stars-display flex items-center justify-center gap-1 mb-2">
                  <span class="text-yellow-500">⭐</span>
                  <span class="font-bold text-gray-700">{{ getAreaStars(3) }}/18</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill animate-progress" :style="{ width: (getAreaStars(3) / 18 * 100) + '%' }"></div>
                </div>
              </div>
              
              <div class="area-status mt-2">
                <div v-if="isAreaUnlocked(3)" class="text-xs text-green-600 font-medium">✅ 已解锁</div>
                <div v-else class="text-xs text-gray-400">🔒 需要完成单词村</div>
              </div>
              
              <div class="area-glow"></div>
            </div>
          </div>

          <!-- 会话广场 -->
          <div class="area-node game-area-node" :class="{ unlocked: isAreaUnlocked(4), current: currentArea === 4 }"
               style="position: absolute; right: 200px; bottom: 400px;"
               @click="selectArea(4)">
            <div class="area-card game-area-card relative overflow-hidden">
              <div class="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-pink-200/30 to-transparent rounded-bl-full"></div>
              
              <div class="area-icon text-6xl mb-3 group-hover:animate-bounce-slow transition-all duration-300">🎪</div>
              <h3 class="area-title">会话广场</h3>
              <p class="area-subtitle">Day 36-45</p>
              
              <div class="area-progress mt-3">
                <div class="stars-display flex items-center justify-center gap-1 mb-2">
                  <span class="text-yellow-500">⭐</span>
                  <span class="font-bold text-gray-700">{{ getAreaStars(4) }}/12</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill animate-progress" :style="{ width: (getAreaStars(4) / 12 * 100) + '%' }"></div>
                </div>
              </div>
              
              <div class="area-status mt-2">
                <div v-if="isAreaUnlocked(4)" class="text-xs text-green-600 font-medium">✅ 已解锁</div>
                <div v-else class="text-xs text-gray-400">🔒 需要完成语法城</div>
              </div>
              
              <div class="area-glow"></div>
            </div>
          </div>

          <!-- 读解森林 -->
          <div class="area-node game-area-node" :class="{ unlocked: isAreaUnlocked(5), current: currentArea === 5 }"
               style="position: absolute; right: 180px; bottom: 600px;"
               @click="selectArea(5)">
            <div class="area-card game-area-card relative overflow-hidden">
              <div class="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-emerald-200/30 to-transparent rounded-bl-full"></div>
              
              <div class="area-icon text-6xl mb-3 group-hover:animate-shake transition-all duration-300">🌲</div>
              <h3 class="area-title">读解森林</h3>
              <p class="area-subtitle">Day 46-53</p>
              
              <div class="area-progress mt-3">
                <div class="stars-display flex items-center justify-center gap-1 mb-2">
                  <span class="text-yellow-500">⭐</span>
                  <span class="font-bold text-gray-700">{{ getAreaStars(5) }}/9</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill animate-progress" :style="{ width: (getAreaStars(5) / 9 * 100) + '%' }"></div>
                </div>
              </div>
              
              <div class="area-status mt-2">
                <div v-if="isAreaUnlocked(5)" class="text-xs text-green-600 font-medium">✅ 已解锁</div>
                <div v-else class="text-xs text-gray-400">🔒 需要完成会话广场</div>
              </div>
              
              <div class="area-glow"></div>
            </div>
          </div>

          <!-- N5试炼塔 -->
          <div class="area-node game-area-node" :class="{ unlocked: isAreaUnlocked(6), current: currentArea === 6 }"
               style="position: absolute; right: 50px; top: 30px;"
               @click="selectArea(6)">
            <div class="area-card game-area-card final-area relative overflow-hidden star-sparkle">
              <div class="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-yellow-200/30 to-transparent rounded-bl-full"></div>
              
              <!-- 特殊发光边框 (最终关卡) -->
              <div class="absolute inset-0 border-2 border-gradient rounded-2xl animate-pulse-glow"></div>
              
              <div class="area-icon text-6xl mb-3 group-hover:animate-pulse-glow transition-all duration-300">🏆</div>
              <h3 class="area-title text-yellow-700 font-bold">N5试炼塔</h3>
              <p class="area-subtitle">Day 54-60</p>
              
              <div class="area-progress mt-3">
                <div class="stars-display flex items-center justify-center gap-1 mb-2">
                  <span class="text-yellow-500">⭐</span>
                  <span class="font-bold text-yellow-700">{{ getAreaStars(6) }}/6</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill animate-progress bg-gradient-to-r from-yellow-400 to-orange-500" 
                       :style="{ width: (getAreaStars(6) / 6 * 100) + '%' }"></div>
                </div>
              </div>
              
              <div class="area-status mt-2">
                <div v-if="isAreaUnlocked(6)" class="text-xs text-yellow-600 font-medium">👑 最终挑战</div>
                <div v-else class="text-xs text-gray-400">🔒 需要完成读解森林</div>
              </div>
              
              <div class="area-glow area-glow-golden"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航栏 - 游戏化设计 -->
    <div class="fixed bottom-0 left-0 right-0 glass-card border-t border-white/30 z-20">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-around">
          <!-- 每日任务 -->
          <button @click="openDailyTasks" class="nav-item interactive group relative">
            <div class="nav-icon text-2xl mb-1 group-hover:animate-bounce-slow transition-all duration-300">📋</div>
            <span class="nav-label text-xs">每日任务</span>
            <div v-if="gameStore.dailyTasksCompleted < gameStore.dailyTasks.length" 
                 class="notification-badge animate-pulse-glow"></div>
            <div class="nav-ripple"></div>
          </button>
          
          <!-- 角色 -->
          <button @click="openProfile" class="nav-item interactive group">
            <div class="nav-icon text-2xl mb-1 group-hover:animate-float transition-all duration-300">👤</div>
            <span class="nav-label text-xs">角色</span>
            <div class="nav-ripple"></div>
          </button>
          
          <!-- 商店 -->
          <button @click="openShop" class="nav-item interactive group">
            <div class="nav-icon text-2xl mb-1 group-hover:animate-shake transition-all duration-300">🏪</div>
            <span class="nav-label text-xs">商店</span>
            <div class="nav-ripple"></div>
          </button>
          
          <!-- 设置 -->
          <button @click="openSettings" class="nav-item interactive group">
            <div class="nav-icon text-2xl mb-1 group-hover:animate-spin transition-all duration-300" style="animation-duration: 2s;">⚙️</div>
            <span class="nav-label text-xs">设置</span>
            <div class="nav-ripple"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'

// Stores and Router
const gameStore = useGameStore()
const authStore = useAuthStore()
const router = useRouter()

// 響應式數據
const currentArea = ref(1)

// 計算屬性
const isAreaUnlocked = computed(() => (areaId) => {
  return gameStore.getAreaUnlockStatus(areaId)
})

// 獲取區域星數
function getAreaStars(areaId) {
  const areaProgress = gameStore.mapProgress[areaId] || {}
  return Object.values(areaProgress).reduce((sum, stage) => sum + (stage.stars || 0), 0)
}

// 選擇區域
function selectArea(areaId) {
  if (!isAreaUnlocked.value(areaId)) {
    gameStore.setError('區域尚未解鎖，請完成前置關卡')
    return
  }
  
  currentArea.value = areaId
  router.push(`/game/area/${areaId}/stages`)
}

// 打開每日任務
function openDailyTasks() {
  router.push('/user/tasks')
}

// 打開角色頁面
function openProfile() {
  router.push('/user/profile')
}

// 打開商店
function openShop() {
  alert('🏪 商店功能即將上線，敬請期待！')
}

// 打開設置
function openSettings() {
  alert('⚙️ 設置功能即將上線，敬請期待！')
}

// 生命週期
onMounted(async () => {
  // 加載地圖進度
  await gameStore.loadMapProgress()
  
  // 加載每日任務
  await gameStore.loadDailyTasks()
})
</script>

<style scoped>
/* === 背景和视差效果 === */
.bg-game-world {
  background: linear-gradient(135deg, 
    #E0F2FE 0%,     /* 天蓝 */
    #BAE6FD 25%,    /* 浅蓝 */
    #F0F9FF 50%,    /* 白蓝 */
    #FEF3C7 75%,    /* 浅黄 */
    #FDF2F8 100%    /* 浅粉 */
  );
  position: relative;
  animation: skyShift 20s ease-in-out infinite;
}

@keyframes skyShift {
  0%, 100% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(10deg) brightness(1.1); }
}

/* 视差层动画 */
.parallax-layer {
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.parallax-far {
  animation: parallaxFar 30s linear infinite;
}

.parallax-mid {
  animation: parallaxMid 15s linear infinite;
}

.parallax-near {
  animation: parallaxNear 8s linear infinite;
}

@keyframes parallaxFar {
  0% { transform: translateX(0); }
  100% { transform: translateX(-10px); }
}

@keyframes parallaxMid {
  0% { transform: translateX(0); }
  100% { transform: translateX(-20px); }
}

@keyframes parallaxNear {
  0% { transform: translateX(0); }
  100% { transform: translateX(-30px); }
}

/* 云朵动画 */
@keyframes cloudFloat {
  0% { transform: translateX(-100px) translateY(0); }
  50% { transform: translateX(0) translateY(-5px); }
  100% { transform: translateX(100px) translateY(0); }
}

.animate-cloud-float {
  animation: cloudFloat linear infinite;
}

/* 樱花飘落 */
@keyframes sakuraFall {
  0% { 
    transform: translateY(-100vh) rotateZ(0deg);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { 
    transform: translateY(100vh) rotateZ(360deg);
    opacity: 0;
  }
}

.animate-sakura-fall {
  animation: sakuraFall linear infinite;
}

/* === 统计卡片样式 === */
.stats-card {
  position: relative;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  transition: all 0.3s var(--ease-smooth);
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stats-icon {
  transition: all 0.3s ease;
}

.stats-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.stats-card:hover .stats-glow {
  opacity: 0.8;
  box-shadow: 0 0 10px currentColor;
}

/* === 区域节点样式 === */
.game-area-node {
  position: relative;
  cursor: pointer;
  transition: all 0.4s var(--ease-smooth);
  z-index: 10;
}

.game-area-node:not(.unlocked) {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(60%);
}

.game-area-node:not(.unlocked):hover {
  transform: none;
}

.game-area-node.unlocked:hover {
  transform: scale(1.08) translateY(-8px);
  z-index: 20;
}

.game-area-node.current .area-card {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
  border: 3px solid #3B82F6;
  transform: scale(1.05);
}

/* 区域卡片 - 升级版 */
.game-area-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  min-width: 160px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.4s var(--ease-bounce);
  border: 2px solid rgba(255, 255, 255, 0.8);
  position: relative;
}

.game-area-card:hover {
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.1);
}

.game-area-card.final-area {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 255, 255, 0.95) 100%);
  border: 3px solid #FFD700;
  box-shadow: 
    0 0 20px rgba(255, 215, 0, 0.3),
    0 10px 30px rgba(0, 0, 0, 0.1);
}

.area-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.25rem;
}

.area-subtitle {
  font-size: 0.8rem;
  color: #6B7280;
  font-weight: 500;
}

/* 区域发光效果 */
.area-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.2), transparent);
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: -1;
}

.area-glow-golden {
  background: linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.3), transparent);
}

.game-area-node:hover .area-glow {
  opacity: 1;
}

/* 进度动画 */
.animate-progress {
  position: relative;
  overflow: hidden;
}

.animate-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: progressShine 3s ease-in-out infinite;
}

@keyframes progressShine {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 边框渐变 */
.border-gradient {
  background: linear-gradient(45deg, #FFD700, #FF6B9D, #60A5FA, #FFD700);
  background-size: 300% 300%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* === 底部导航样式 === */
.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  transition: all 0.3s var(--ease-smooth);
  color: #6B7280;
  background: transparent;
  border: none;
  cursor: pointer;
  overflow: hidden;
}

.nav-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  transform: translateY(-2px);
}

.nav-icon {
  transition: all 0.3s ease;
  transform-origin: center;
}

.nav-label {
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 波纹效果 */
.nav-ripple {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  border-radius: 12px;
  pointer-events: none;
}

.nav-item:active .nav-ripple {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 1;
  }
}

/* 通知徽章 */
.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: linear-gradient(45deg, #EF4444, #F87171);
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* 数字滚动动画 */
.count-up {
  animation: countUp 0.8s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义动画 */
.animate-spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 脉冲慢动画 */
.animate-pulse-slow {
  animation: pulseSlow 3s ease-in-out infinite;
}

@keyframes pulseSlow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* === 响应式设计 === */
@media (max-width: 768px) {
  .areas-container {
    transform: scale(0.85);
    transform-origin: center;
  }
  
  .game-area-card {
    min-width: 140px;
    padding: 1.2rem;
  }
  
  .area-icon {
    font-size: 3.5rem !important;
  }
  
  .area-title {
    font-size: 1rem;
  }
  
  .area-subtitle {
    font-size: 0.7rem;
  }
  
  .nav-item {
    padding: 0.5rem 0.75rem;
  }
  
  .nav-icon {
    font-size: 1.5rem !important;
  }
  
  .nav-label {
    font-size: 0.625rem !important;
  }
}

@media (max-width: 480px) {
  .areas-container {
    transform: scale(0.75);
  }
  
  .game-area-card {
    min-width: 120px;
    padding: 1rem;
  }
  
  .area-icon {
    font-size: 3rem !important;
  }
}

/* 性能优化 - 只在必要时使用3D变换 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>