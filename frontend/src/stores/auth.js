import { defineStore } from 'pinia'
import axios from 'axios'

// API 基礎配置
const api = axios.create({
  baseURL: `http://${window.location.hostname}:3002/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器 - 自動添加 token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 響應攔截器 - 處理 401 錯誤
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token 過期或無效，清除本地存儲
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 用戶信息
    user: null,
    
    // 認證狀態
    isAuthenticated: false,
    
    // 加載狀態
    loading: false,
    
    // 錯誤信息
    error: null
  }),

  getters: {
    // 獲取用戶等級
    userLevel: (state) => state.user?.level || 1,
    
    // 獲取用戶經驗
    userExp: (state) => state.user?.exp || 0,
    
    // 獲取用戶金幣
    userCoins: (state) => state.user?.coins || 0,
    
    // 獲取用戶昵稱
    userNickname: (state) => state.user?.nickname || state.user?.username || '冒險者',
    
    // 計算等級進度
    levelProgress: (state) => {
      if (!state.user) return 0
      const currentExp = state.user.exp
      const currentLevel = state.user.level
      
      // 升級所需經驗計算（參考 PRD）
      let expForCurrentLevel
      if (currentLevel <= 10) {
        expForCurrentLevel = (currentLevel - 1) * 100
      } else if (currentLevel <= 25) {
        expForCurrentLevel = 1000 + (currentLevel - 11) * 150
      } else if (currentLevel <= 40) {
        expForCurrentLevel = 3100 + (currentLevel - 26) * 200
      } else if (currentLevel <= 50) {
        expForCurrentLevel = 6100 + (currentLevel - 41) * 250
      } else if (currentLevel <= 58) {
        expForCurrentLevel = 8600 + (currentLevel - 51) * 300
      } else {
        expForCurrentLevel = 11000 + (currentLevel - 59) * 500
      }
      
      let expForNextLevel
      if (currentLevel < 10) {
        expForNextLevel = currentLevel * 100
      } else if (currentLevel < 25) {
        expForNextLevel = 1000 + (currentLevel - 10) * 150
      } else if (currentLevel < 40) {
        expForNextLevel = 3100 + (currentLevel - 25) * 200
      } else if (currentLevel < 50) {
        expForNextLevel = 6100 + (currentLevel - 40) * 250
      } else if (currentLevel < 58) {
        expForNextLevel = 8600 + (currentLevel - 50) * 300
      } else if (currentLevel < 60) {
        expForNextLevel = 11000 + (currentLevel - 58) * 500
      } else {
        return 100 // 滿級
      }
      
      const progress = ((currentExp - expForCurrentLevel) / (expForNextLevel - expForCurrentLevel)) * 100
      return Math.max(0, Math.min(100, progress))
    },
    
    // 獲取等級稱號
    levelTitle: (state) => {
      if (!state.user) return '見習生'
      const level = state.user.level
      
      if (level <= 10) return '言靈見習生'
      if (level <= 25) return '單詞獵人'
      if (level <= 40) return '語法劍士'
      if (level <= 50) return '會話達人'
      if (level <= 58) return '讀解賢者'
      if (level <= 60) return 'N5挑戰者'
      return '日語冒險家'
    }
  },

  actions: {
    // 設置加載狀態
    setLoading(loading) {
      this.loading = loading
    },

    // 設置錯誤信息
    setError(error) {
      this.error = error
      // 3秒後自動清除錯誤
      setTimeout(() => {
        this.error = null
      }, 3000)
    },

    // 設置用戶信息
    setUser(user) {
      this.user = user
      this.isAuthenticated = !!user
    },

    // 用戶註冊
    async register(userData) {
      try {
        this.setLoading(true)
        this.setError(null)
        
        const response = await api.post('/auth/register', userData)
        const { token, user } = response.data
        
        // 保存 token
        localStorage.setItem('token', token)
        
        // 設置用戶狀態
        this.setUser(user)
        
        return { success: true }
        
      } catch (error) {
        console.error('註冊失敗:', error)
        this.setError(error.response?.data?.message || '註冊失敗，請檢查網絡連接')
        return { success: false, error: this.error }
        
      } finally {
        this.setLoading(false)
      }
    },

    // 用戶登入
    async login(credentials) {
      try {
        this.setLoading(true)
        this.setError(null)
        
        const response = await api.post('/auth/login', credentials)
        const { token, user } = response.data
        
        // 保存 token
        localStorage.setItem('token', token)
        
        // 設置用戶狀態
        this.setUser(user)
        
        return { success: true }
        
      } catch (error) {
        console.error('登入失敗:', error)
        this.setError(error.response?.data?.message || '登入失敗，請檢查用戶名和密碼')
        return { success: false, error: this.error }
        
      } finally {
        this.setLoading(false)
      }
    },

    // 檢查認證狀態
    async checkAuth() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.logout()
          return false
        }
        
        const response = await api.get('/user/profile')
        this.setUser(response.data.user)
        
        return true
        
      } catch (error) {
        console.error('認證檢查失敗:', error)
        this.logout()
        return false
      }
    },

    // 更新用戶信息
    async updateProfile(updates) {
      try {
        this.setLoading(true)
        
        const response = await api.put('/user/profile', updates)
        this.setUser(response.data.user)
        
        return { success: true }
        
      } catch (error) {
        console.error('更新用戶信息失敗:', error)
        this.setError(error.response?.data?.message || '更新失敗')
        return { success: false, error: this.error }
        
      } finally {
        this.setLoading(false)
      }
    },

    // 用戶登出
    logout() {
      localStorage.removeItem('token')
      this.setUser(null)
      this.setError(null)
    },

    // 增加經驗值
    addExp(amount) {
      if (this.user) {
        this.user.exp += amount
        
        // 檢查是否升級（簡化版本，實際應由後端計算）
        // 這裡只做樂觀更新，實際數據以後端返回為準
      }
    },

    // 增加金幣
    addCoins(amount) {
      if (this.user) {
        this.user.coins += amount
      }
    }
  }
})

export { api }