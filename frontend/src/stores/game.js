import { defineStore } from 'pinia'
import { api } from './auth.js'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 地圖進度
    mapProgress: {},
    
    // 當前關卡信息
    currentStage: null,
    
    // 用戶學習進度
    userProgress: {
      vocabulary: {},
      grammar: {},
      stages: {}
    },
    
    // 每日任務
    dailyTasks: [],
    
    // 成就
    achievements: [],
    
    // 遊戲配置
    gameSettings: {
      soundEnabled: true,
      musicEnabled: true,
      voiceEnabled: true,
      autoPlay: false
    },
    
    // 加載狀態
    loading: false,
    error: null
  }),

  getters: {
    // 獲取區域解鎖狀態
    getAreaUnlockStatus: (state) => (areaId) => {
      if (areaId === 1) return true // 第一個區域默認解鎖
      
      // 檢查前一個區域是否有足夠的星星解鎖下一區域
      const prevAreaProgress = state.mapProgress[areaId - 1] || {}
      const totalStars = Object.values(prevAreaProgress).reduce((sum, stage) => sum + (stage.stars || 0), 0)
      
      // 每個區域需要前一區域至少70%的星星才能解鎖（假設每區域8關，需要約17星）
      const requiredStars = Math.ceil(8 * 2.1) // 至少需要17星
      return totalStars >= requiredStars
    },

    // 獲取關卡解鎖狀態
    getStageUnlockStatus: (state) => (areaId, stageId) => {
      if (stageId === 1) return true // 每個區域第一關默認解鎖
      
      // 檢查前一關是否完成
      const prevStage = state.mapProgress[areaId]?.[stageId - 1]
      return prevStage && prevStage.stars > 0
    },

    // 獲取關卡星級
    getStageStars: (state) => (areaId, stageId) => {
      return state.mapProgress[areaId]?.[stageId]?.stars || 0
    },

    // 計算總星星數
    totalStars: (state) => {
      let total = 0
      Object.values(state.mapProgress).forEach(area => {
        Object.values(area).forEach(stage => {
          total += stage.stars || 0
        })
      })
      return total
    },

    // 計算完成的關卡數
    completedStages: (state) => {
      let completed = 0
      Object.values(state.mapProgress).forEach(area => {
        Object.values(area).forEach(stage => {
          if (stage.stars > 0) completed++
        })
      })
      return completed
    },

    // 獲取每日任務完成狀態
    dailyTasksCompleted: (state) => {
      return state.dailyTasks.filter(task => task.completed).length
    },

    // 獲取今日是否全部任務完成
    allDailyTasksCompleted: (state) => {
      return state.dailyTasks.length > 0 && state.dailyTasks.every(task => task.completed)
    },

    // 獲取掌握的單詞數
    masteredWords: (state) => {
      return Object.values(state.userProgress.vocabulary).filter(word => word.mastery_level >= 3).length
    },

    // 獲取掌握的語法數
    masteredGrammar: (state) => {
      return Object.values(state.userProgress.grammar).filter(grammar => grammar.mastery_level >= 3).length
    }
  },

  actions: {
    // 設置加載狀態
    setLoading(loading) {
      this.loading = loading
    },

    // 設置錯誤
    setError(error) {
      this.error = error
      setTimeout(() => {
        this.error = null
      }, 3000)
    },

    // 加載地圖進度
    async loadMapProgress() {
      try {
        this.setLoading(true)
        const response = await api.get('/map/progress')
        this.mapProgress = response.data.progress || {}
        return { success: true }
        
      } catch (error) {
        console.error('加載地圖進度失敗:', error)
        this.setError('加載進度失敗')
        return { success: false }
        
      } finally {
        this.setLoading(false)
      }
    },

    // 加載關卡配置
    async loadStageConfig(areaId, stageId) {
      try {
        this.setLoading(true)
        const response = await api.get(`/stage/${areaId}/${stageId}`)
        this.currentStage = response.data.stage
        return { success: true, stage: response.data.stage }
        
      } catch (error) {
        console.error('加載關卡配置失敗:', error)
        this.setError('加載關卡失敗')
        return { success: false }
        
      } finally {
        this.setLoading(false)
      }
    },

    // 提交關卡結果
    async submitStageResult(areaId, stageId, result) {
      try {
        this.setLoading(true)
        const response = await api.post(`/stage/${areaId}/${stageId}/complete`, result)
        
        // 更新本地進度
        if (!this.mapProgress[areaId]) {
          this.mapProgress[areaId] = {}
        }
        this.mapProgress[areaId][stageId] = response.data.progress
        
        return { 
          success: true, 
          progress: response.data.progress,
          rewards: response.data.rewards
        }
        
      } catch (error) {
        console.error('提交關卡結果失敗:', error)
        this.setError('提交結果失敗')
        return { success: false }
        
      } finally {
        this.setLoading(false)
      }
    },

    // 加載每日任務
    async loadDailyTasks() {
      try {
        const response = await api.get('/daily-tasks')
        this.dailyTasks = response.data.tasks || []
        return { success: true }
        
      } catch (error) {
        console.error('加載每日任務失敗:', error)
        this.setError('加載任務失敗')
        return { success: false }
      }
    },

    // 完成每日任務
    async completeDailyTask(taskType) {
      try {
        const response = await api.post(`/daily-tasks/${taskType}/complete`)
        
        // 更新本地任務狀態
        const task = this.dailyTasks.find(t => t.type === taskType)
        if (task) {
          task.completed = true
          task.completed_at = new Date().toISOString()
        }
        
        return { 
          success: true, 
          rewards: response.data.rewards 
        }
        
      } catch (error) {
        console.error('完成每日任務失敗:', error)
        this.setError('任務完成失敗')
        return { success: false }
      }
    },

    // 加載成就
    async loadAchievements() {
      try {
        const response = await api.get('/achievements')
        this.achievements = response.data.achievements || []
        return { success: true }
        
      } catch (error) {
        console.error('加載成就失敗:', error)
        return { success: false }
      }
    },

    // 加載用戶學習進度
    async loadUserProgress() {
      try {
        const response = await api.get('/user/progress')
        this.userProgress = response.data.progress || {
          vocabulary: {},
          grammar: {},
          stages: {}
        }
        return { success: true }
        
      } catch (error) {
        console.error('加載學習進度失敗:', error)
        return { success: false }
      }
    },

    // 更新單詞學習記錄
    async updateVocabularyProgress(wordId, result) {
      try {
        const response = await api.post('/vocabulary/result', {
          word_id: wordId,
          correct: result.correct,
          time_spent: result.timeSpent
        })
        
        // 更新本地進度
        this.userProgress.vocabulary[wordId] = response.data.progress
        
        return { success: true }
        
      } catch (error) {
        console.error('更新單詞進度失敗:', error)
        return { success: false }
      }
    },

    // 獲取復習單詞列表
    async getReviewWords() {
      try {
        const response = await api.get('/vocabulary/review')
        return { 
          success: true, 
          words: response.data.words || [] 
        }
        
      } catch (error) {
        console.error('獲取復習單詞失敗:', error)
        return { success: false, words: [] }
      }
    },

    // 保存遊戲設置
    saveGameSettings() {
      localStorage.setItem('nihongo_game_settings', JSON.stringify(this.gameSettings))
    },

    // 加載遊戲設置
    loadGameSettings() {
      const saved = localStorage.getItem('nihongo_game_settings')
      if (saved) {
        try {
          this.gameSettings = { ...this.gameSettings, ...JSON.parse(saved) }
        } catch (error) {
          console.error('加載遊戲設置失敗:', error)
        }
      }
    },

    // 更新遊戲設置
    updateGameSettings(updates) {
      this.gameSettings = { ...this.gameSettings, ...updates }
      this.saveGameSettings()
    }
  }
})