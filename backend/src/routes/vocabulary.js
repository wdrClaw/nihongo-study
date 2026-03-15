import express from 'express';
import { db } from '../../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

/**
 * 獲取需要復習的單詞
 * GET /api/vocabulary/review
 */
router.get('/review', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('用戶ID:', userId);
    
    // 最簡化版：直接獲取基礎單詞（硬編碼限制）
    const [words] = await db.execute(
      'SELECT * FROM word WHERE jlpt_level = ? ORDER BY id LIMIT 10',
      ['N5']
    );

    // 為每個單詞添加默認學習狀態
    const wordsWithStatus = words.map(word => ({
      ...word,
      mastery_level: 0,
      wrong_count: 0,
      correct_count: 0,
      next_review: null
    }));

    res.json({
      success: true,
      words: wordsWithStatus
    });

  } catch (error) {
    console.error('獲取復習單詞失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 提交單詞學習結果
 * POST /api/vocabulary/result
 */
router.post('/result', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { word_id, correct, time_spent } = req.body;
    const userId = req.userId;

    // 驗證輸入
    if (!word_id || typeof correct !== 'boolean') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '無效的學習結果數據'
      });
    }

    // 獲取或創建用戶單詞記錄
    const [existing] = await connection.execute(
      'SELECT * FROM user_vocabulary WHERE user_id = ? AND word_id = ?',
      [userId, word_id]
    );

    let masteryLevel, intervalDays, easeFactor;

    if (existing.length === 0) {
      // 新單詞
      masteryLevel = correct ? 1 : 0;
      intervalDays = correct ? 1 : 0;
      easeFactor = 2.5;
      
      await connection.execute(`
        INSERT INTO user_vocabulary (
          user_id, word_id, correct_count, wrong_count, 
          last_review, next_review, mastery_level, ease_factor, interval_days
        ) VALUES (?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?, ?, ?)
      `, [
        userId, word_id, 
        correct ? 1 : 0, correct ? 0 : 1,
        intervalDays, masteryLevel, easeFactor, intervalDays
      ]);
    } else {
      // 已有記錄，使用SRS算法更新
      const record = existing[0];
      const srsResult = calculateSRS(record, correct);
      
      await connection.execute(`
        UPDATE user_vocabulary SET
          correct_count = correct_count + ?,
          wrong_count = wrong_count + ?,
          last_review = NOW(),
          next_review = DATE_ADD(NOW(), INTERVAL ? DAY),
          mastery_level = ?,
          ease_factor = ?,
          interval_days = ?
        WHERE user_id = ? AND word_id = ?
      `, [
        correct ? 1 : 0, correct ? 0 : 1,
        srsResult.intervalDays, srsResult.masteryLevel,
        srsResult.easeFactor, srsResult.intervalDays,
        userId, word_id
      ]);
      
      masteryLevel = srsResult.masteryLevel;
      intervalDays = srsResult.intervalDays;
      easeFactor = srsResult.easeFactor;
    }

    // 更新每日任務進度（學習新單詞）
    if (correct) {
      await updateDailyTaskProgress(connection, userId, 'learn_words', 1);
    }

    await connection.commit();

    // 獲取更新後的記錄
    const [updated] = await connection.execute(
      'SELECT * FROM user_vocabulary WHERE user_id = ? AND word_id = ?',
      [userId, word_id]
    );

    res.json({
      success: true,
      progress: updated[0]
    });

  } catch (error) {
    await connection.rollback();
    console.error('提交單詞結果失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  } finally {
    connection.release();
  }
});

/**
 * 獲取單詞統計信息
 * GET /api/vocabulary/stats
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // 獲取各級別掌握的單詞數
    const [stats] = await db.execute(`
      SELECT 
        mastery_level,
        COUNT(*) as count
      FROM user_vocabulary 
      WHERE user_id = ?
      GROUP BY mastery_level
    `, [userId]);

    // 獲取今日學習統計
    const [todayStats] = await db.execute(`
      SELECT 
        COUNT(*) as words_studied,
        SUM(CASE WHEN uv.last_review >= CURDATE() AND uv.correct_count > uv.wrong_count THEN 1 ELSE 0 END) as correct_today
      FROM user_vocabulary uv
      WHERE uv.user_id = ? AND uv.last_review >= CURDATE()
    `, [userId]);

    // 獲取需要復習的單詞數
    const [reviewCount] = await db.execute(`
      SELECT COUNT(*) as count
      FROM user_vocabulary 
      WHERE user_id = ? AND next_review <= NOW()
    `, [userId]);

    res.json({
      success: true,
      stats: {
        mastery_levels: stats,
        today: todayStats[0] || { words_studied: 0, correct_today: 0 },
        review_pending: reviewCount[0].count
      }
    });

  } catch (error) {
    console.error('獲取單詞統計失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 獲取單詞詳情
 * GET /api/vocabulary/word/:wordId
 */
router.get('/word/:wordId', authenticateToken, async (req, res) => {
  try {
    const { wordId } = req.params;
    const userId = req.userId;

    // 獲取單詞詳情
    const [words] = await db.execute('SELECT * FROM word WHERE id = ?', [wordId]);
    
    if (words.length === 0) {
      return res.status(404).json({
        success: false,
        message: '單詞不存在'
      });
    }

    // 獲取用戶學習記錄
    const [userProgress] = await db.execute(
      'SELECT * FROM user_vocabulary WHERE user_id = ? AND word_id = ?',
      [userId, wordId]
    );

    res.json({
      success: true,
      word: words[0],
      user_progress: userProgress.length > 0 ? userProgress[0] : null
    });

  } catch (error) {
    console.error('獲取單詞詳情失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * SRS算法計算下次復習時間
 */
function calculateSRS(record, correct) {
  let { mastery_level, ease_factor, interval_days } = record;
  
  if (correct) {
    // 答對了
    mastery_level = Math.min(4, mastery_level + 1);
    
    if (mastery_level === 1) {
      interval_days = 1;
    } else if (mastery_level === 2) {
      interval_days = 6;
    } else {
      interval_days = Math.ceil(interval_days * ease_factor);
    }
    
    // 提高ease_factor（最大3.0）
    ease_factor = Math.min(3.0, ease_factor + 0.1);
    
  } else {
    // 答錯了
    mastery_level = Math.max(0, mastery_level - 1);
    interval_days = 1; // 重新開始
    
    // 降低ease_factor（最小1.3）
    ease_factor = Math.max(1.3, ease_factor - 0.2);
  }
  
  return {
    masteryLevel: mastery_level,
    intervalDays: interval_days,
    easeFactor: ease_factor
  };
}

/**
 * 更新每日任務進度
 */
async function updateDailyTaskProgress(connection, userId, taskType, progress) {
  const today = new Date().toISOString().split('T')[0];
  
  await connection.execute(`
    INSERT INTO user_daily_task (user_id, task_date, task_type, progress, target_count, completed)
    SELECT ?, ?, ?, ?, target_count, ? >= target_count
    FROM daily_task_template 
    WHERE id = ?
    ON DUPLICATE KEY UPDATE
      progress = progress + VALUES(progress),
      completed = progress + VALUES(progress) >= target_count
  `, [userId, today, taskType, progress, progress, taskType]);
}

export default router;