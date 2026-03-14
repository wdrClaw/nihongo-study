import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 頁面組件（懶加載）
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const WorldMap = () => import('@/views/game/WorldMap.vue')
const StageSelect = () => import('@/views/game/StageSelect.vue')
const GamePlay = () => import('@/views/game/GamePlay.vue')
const Profile = () => import('@/views/user/Profile.vue')
const DailyTasks = () => import('@/views/user/DailyTasks.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: false }
    },
    {
      path: '/auth',
      name: 'auth',
      redirect: '/auth/login',
      children: [
        {
          path: 'login',
          name: 'login',
          component: Login,
          meta: { requiresAuth: false, hideForAuth: true }
        },
        {
          path: 'register',
          name: 'register',
          component: Register,
          meta: { requiresAuth: false, hideForAuth: true }
        }
      ]
    },
    {
      path: '/game',
      name: 'game',
      redirect: '/game/map',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'map',
          name: 'worldMap',
          component: WorldMap,
          meta: { requiresAuth: true }
        },
        {
          path: 'area/:areaId/stages',
          name: 'stageSelect',
          component: StageSelect,
          meta: { requiresAuth: true },
          props: true
        },
        {
          path: 'area/:areaId/stage/:stageId',
          name: 'gamePlay',
          component: GamePlay,
          meta: { requiresAuth: true },
          props: true
        }
      ]
    },
    {
      path: '/user',
      name: 'user',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'profile',
          name: 'profile',
          component: Profile,
          meta: { requiresAuth: true }
        },
        {
          path: 'tasks',
          name: 'dailyTasks',
          component: DailyTasks,
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      redirect: '/'
    }
  ]
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 檢查認證狀態
  if (!authStore.isAuthenticated && localStorage.getItem('token')) {
    try {
      await authStore.checkAuth()
    } catch (error) {
      // Token 無效，清除本地存儲
      localStorage.removeItem('token')
      authStore.logout()
    }
  }
  
  // 需要登入的頁面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  // 已登入用戶訪問登入/註冊頁面，重定向到遊戲地圖
  if (to.meta.hideForAuth && authStore.isAuthenticated) {
    next({ name: 'worldMap' })
    return
  }
  
  next()
})

export default router