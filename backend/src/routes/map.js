import express from 'express';
import { db } from '../../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// 所有地圖路由都需要認證
router.use(authenticateToken);

/**
 * 獲取地圖進度
 * GET /api/map/progress
 */
router.get('/progress', async (req, res) => {
  try {
    // 獲取用戶的關卡進度
    const [stageProgress] = await db.execute(
      'SELECT area_id, stage_id, stars, best_score, attempts, completed_at FROM user_stage_progress WHERE user_id = ? ORDER BY area_id, stage_id',
      [req.userId]
    );

    // 組織數據結構
    const progress = {};
    
    stageProgress.forEach(stage => {
      if (!progress[stage.area_id]) {
        progress[stage.area_id] = {};
      }
      
      progress[stage.area_id][stage.stage_id] = {
        stars: stage.stars,
        best_score: stage.best_score,
        attempts: stage.attempts,
        completed_at: stage.completed_at,
        unlocked: true
      };
    });

    // 確保第一個區域第一關總是解鎖的
    if (!progress[1]) {
      progress[1] = {};
    }
    if (!progress[1][1]) {
      progress[1][1] = {
        stars: 0,
        best_score: 0,
        attempts: 0,
        completed_at: null,
        unlocked: true
      };
    }

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('獲取地圖進度失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 獲取區域統計
 * GET /api/map/area/:areaId/stats
 */
router.get('/area/:areaId/stats', async (req, res) => {
  try {
    const areaId = parseInt(req.params.areaId);
    
    if (isNaN(areaId) || areaId < 1 || areaId > 6) {
      return res.status(400).json({
        success: false,
        message: '無效的區域ID'
      });
    }

    // 獲取該區域的所有關卡進度
    const [stageProgress] = await db.execute(
      'SELECT stage_id, stars, best_score, attempts FROM user_stage_progress WHERE user_id = ? AND area_id = ?',
      [req.userId, areaId]
    );

    // 計算統計數據
    const totalStages = 8; // 假設每個區域有8個關卡
    const completedStages = stageProgress.filter(stage => stage.stars > 0).length;
    const totalStars = stageProgress.reduce((sum, stage) => sum + stage.stars, 0);
    const totalAttempts = stageProgress.reduce((sum, stage) => sum + stage.attempts, 0);
    const averageScore = stageProgress.length > 0 
      ? Math.round(stageProgress.reduce((sum, stage) => sum + stage.best_score, 0) / stageProgress.length)
      : 0;

    // 計算完成百分比
    const completionPercentage = Math.round((completedStages / totalStages) * 100);

    res.json({
      success: true,
      stats: {
        area_id: areaId,
        total_stages: totalStages,
        completed_stages: completedStages,
        completion_percentage: completionPercentage,
        total_stars: totalStars,
        total_attempts: totalAttempts,
        average_score: averageScore,
        unlocked: areaId === 1 || completedStages > 0 // 簡化的解鎖邏輯
      }
    });

  } catch (error) {
    console.error('獲取區域統計失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 解鎖下一關卡
 * POST /api/map/unlock-stage
 */
router.post('/unlock-stage', async (req, res) => {
  try {
    const { area_id, stage_id } = req.body;

    if (!area_id || !stage_id) {
      return res.status(400).json({
        success: false,
        message: '區域ID和關卡ID不能為空'
      });
    }

    // 檢查是否已經有記錄
    const [existing] = await db.execute(
      'SELECT id FROM user_stage_progress WHERE user_id = ? AND area_id = ? AND stage_id = ?',
      [req.userId, area_id, stage_id]
    );

    if (existing.length === 0) {
      // 創建新的關卡記錄
      await db.execute(
        'INSERT INTO user_stage_progress (user_id, area_id, stage_id, stars, best_score, attempts) VALUES (?, ?, ?, 0, 0, 0)',
        [req.userId, area_id, stage_id]
      );
    }

    res.json({
      success: true,
      message: '關卡已解鎖'
    });

  } catch (error) {
    console.error('解鎖關卡失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

export default router;