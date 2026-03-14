import express from 'express';
import { db } from '../../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// 所有用戶路由都需要認證
router.use(authenticateToken);

/**
 * 獲取用戶個人資料
 * GET /api/user/profile
 */
router.get('/profile', async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, nickname, email, level, exp, coins, consecutive_days, created_at, updated_at FROM user WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('獲取用戶資料失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 更新用戶個人資料
 * PUT /api/user/profile
 */
router.put('/profile', async (req, res) => {
  try {
    const { nickname, email } = req.body;
    const updates = [];
    const values = [];

    // 驗證和構建更新字段
    if (nickname !== undefined) {
      if (nickname.length > 20) {
        return res.status(400).json({
          success: false,
          message: '暱稱不能超過20個字符'
        });
      }
      updates.push('nickname = ?');
      values.push(nickname);
    }

    if (email !== undefined) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: '請輸入有效的郵箱地址'
        });
      }

      // 檢查郵箱是否被其他用戶使用
      if (email) {
        const [existingEmails] = await db.execute(
          'SELECT id FROM user WHERE email = ? AND id != ?',
          [email, req.userId]
        );

        if (existingEmails.length > 0) {
          return res.status(400).json({
            success: false,
            message: '郵箱已被其他用戶使用'
          });
        }
      }

      updates.push('email = ?');
      values.push(email || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '沒有提供要更新的字段'
      });
    }

    // 執行更新
    values.push(req.userId);
    await db.execute(
      `UPDATE user SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // 返回更新後的用戶信息
    const [users] = await db.execute(
      'SELECT id, username, nickname, email, level, exp, coins, consecutive_days, created_at, updated_at FROM user WHERE id = ?',
      [req.userId]
    );

    res.json({
      success: true,
      message: '個人資料更新成功',
      user: users[0]
    });

  } catch (error) {
    console.error('更新用戶資料失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 獲取用戶學習進度
 * GET /api/user/progress
 */
router.get('/progress', async (req, res) => {
  try {
    // 獲取關卡進度
    const [stageProgress] = await db.execute(
      'SELECT area_id, stage_id, stars, best_score, attempts, completed_at FROM user_stage_progress WHERE user_id = ?',
      [req.userId]
    );

    // 獲取單詞學習進度
    const [vocabularyProgress] = await db.execute(
      'SELECT word_id, correct_count, wrong_count, mastery_level, last_review FROM user_vocabulary WHERE user_id = ?',
      [req.userId]
    );

    // 獲取語法學習進度
    const [grammarProgress] = await db.execute(
      'SELECT grammar_id, mastery_level, practice_count, last_practice FROM user_grammar WHERE user_id = ?',
      [req.userId]
    );

    // 組織數據
    const progress = {
      stages: {},
      vocabulary: {},
      grammar: {}
    };

    // 關卡進度
    stageProgress.forEach(stage => {
      if (!progress.stages[stage.area_id]) {
        progress.stages[stage.area_id] = {};
      }
      progress.stages[stage.area_id][stage.stage_id] = {
        stars: stage.stars,
        best_score: stage.best_score,
        attempts: stage.attempts,
        completed_at: stage.completed_at
      };
    });

    // 單詞進度
    vocabularyProgress.forEach(word => {
      progress.vocabulary[word.word_id] = {
        correct_count: word.correct_count,
        wrong_count: word.wrong_count,
        mastery_level: word.mastery_level,
        last_review: word.last_review
      };
    });

    // 語法進度
    grammarProgress.forEach(grammar => {
      progress.grammar[grammar.grammar_id] = {
        mastery_level: grammar.mastery_level,
        practice_count: grammar.practice_count,
        last_practice: grammar.last_practice
      };
    });

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('獲取學習進度失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 獲取用戶成就
 * GET /api/user/achievements
 */
router.get('/achievements', async (req, res) => {
  try {
    const [achievements] = await db.execute(
      'SELECT achievement_id, unlocked_at FROM user_achievement WHERE user_id = ? ORDER BY unlocked_at DESC',
      [req.userId]
    );

    res.json({
      success: true,
      achievements
    });

  } catch (error) {
    console.error('獲取成就失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 增加用戶經驗值
 * POST /api/user/add-exp
 */
router.post('/add-exp', async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '經驗值必須大於0'
      });
    }

    // 獲取當前用戶信息
    const [users] = await db.execute(
      'SELECT level, exp FROM user WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在'
      });
    }

    const currentUser = users[0];
    const newExp = currentUser.exp + amount;
    
    // 計算新等級（簡化版本）
    let newLevel = currentUser.level;
    let expForNext = getExpForLevel(newLevel + 1);
    
    while (newExp >= expForNext && newLevel < 60) {
      newLevel++;
      expForNext = getExpForLevel(newLevel + 1);
    }

    // 更新數據庫
    await db.execute(
      'UPDATE user SET exp = ?, level = ? WHERE id = ?',
      [newExp, newLevel, req.userId]
    );

    // 檢查是否升級
    const levelUp = newLevel > currentUser.level;

    res.json({
      success: true,
      message: '經驗值添加成功',
      exp_added: amount,
      new_exp: newExp,
      new_level: newLevel,
      level_up: levelUp,
      reason: reason || '完成任務'
    });

  } catch (error) {
    console.error('添加經驗值失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 增加用戶金幣
 * POST /api/user/add-coins
 */
router.post('/add-coins', async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '金幣數量必須大於0'
      });
    }

    // 更新金幣
    await db.execute(
      'UPDATE user SET coins = coins + ? WHERE id = ?',
      [amount, req.userId]
    );

    // 獲取更新後的金幣數量
    const [users] = await db.execute(
      'SELECT coins FROM user WHERE id = ?',
      [req.userId]
    );

    res.json({
      success: true,
      message: '金幣添加成功',
      coins_added: amount,
      new_coins: users[0].coins,
      reason: reason || '完成任務'
    });

  } catch (error) {
    console.error('添加金幣失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 計算指定等級所需的經驗值
 */
function getExpForLevel(level) {
  if (level <= 10) {
    return (level - 1) * 100;
  } else if (level <= 25) {
    return 1000 + (level - 11) * 150;
  } else if (level <= 40) {
    return 3100 + (level - 26) * 200;
  } else if (level <= 50) {
    return 6100 + (level - 41) * 250;
  } else if (level <= 58) {
    return 8600 + (level - 51) * 300;
  } else {
    return 11000 + (level - 59) * 500;
  }
}

export default router;