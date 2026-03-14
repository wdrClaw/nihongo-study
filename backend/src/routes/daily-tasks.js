import express from 'express';
import { db } from '../../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

/**
 * 獲取今日任務列表
 * GET /api/daily-tasks
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    // 獲取今日任務（如果不存在則創建）
    await ensureDailyTasks(userId, today);

    // 獲取今日任務列表
    const [tasks] = await db.execute(`
      SELECT 
        udt.*,
        dtt.name_cn,
        dtt.description_cn,
        dtt.icon,
        dtt.reward_exp,
        dtt.reward_coins
      FROM user_daily_task udt
      JOIN daily_task_template dtt ON udt.task_type = dtt.id
      WHERE udt.user_id = ? AND udt.task_date = ?
      ORDER BY dtt.id
    `, [userId, today]);

    res.json({
      success: true,
      tasks: tasks
    });

  } catch (error) {
    console.error('獲取每日任務失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 完成每日任務
 * POST /api/daily-tasks/:taskType/complete
 */
router.post('/:taskType/complete', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { taskType } = req.params;
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    // 檢查任務是否存在
    const [templates] = await connection.execute(
      'SELECT * FROM daily_task_template WHERE id = ?',
      [taskType]
    );

    if (templates.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '任務類型不存在'
      });
    }

    const template = templates[0];

    // 獲取用戶今日任務
    const [userTasks] = await connection.execute(
      'SELECT * FROM user_daily_task WHERE user_id = ? AND task_date = ? AND task_type = ?',
      [userId, today, taskType]
    );

    if (userTasks.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '今日任務不存在'
      });
    }

    const userTask = userTasks[0];

    // 檢查任務是否已完成
    if (userTask.completed) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '任務已完成'
      });
    }

    // 更新任務進度為完成
    await connection.execute(`
      UPDATE user_daily_task 
      SET progress = target_count, completed = TRUE, completed_at = NOW()
      WHERE user_id = ? AND task_date = ? AND task_type = ?
    `, [userId, today, taskType]);

    // 給用戶發放獎勵
    await connection.execute(
      'UPDATE user SET exp = exp + ?, coins = coins + ? WHERE id = ?',
      [template.reward_exp, template.reward_coins, userId]
    );

    // 檢查是否所有任務都完成了（全完成獎勵）
    const [allTasks] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(completed) as completed FROM user_daily_task WHERE user_id = ? AND task_date = ?',
      [userId, today]
    );

    let bonusRewards = { exp: 0, coins: 0 };
    if (allTasks[0].total === allTasks[0].completed && allTasks[0].total > 0) {
      // 所有任務完成，給予額外獎勵
      bonusRewards = { exp: 100, coins: 50 };
      await connection.execute(
        'UPDATE user SET exp = exp + ?, coins = coins + ? WHERE id = ?',
        [bonusRewards.exp, bonusRewards.coins, userId]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      rewards: {
        exp: template.reward_exp + bonusRewards.exp,
        coins: template.reward_coins + bonusRewards.coins,
        bonus: bonusRewards.exp > 0
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('完成每日任務失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  } finally {
    connection.release();
  }
});

/**
 * 獲取每日任務統計
 * GET /api/daily-tasks/stats
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    // 獲取今日完成統計
    const [todayStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(completed) as completed_tasks,
        SUM(CASE WHEN completed THEN reward_exp ELSE 0 END) as earned_exp,
        SUM(CASE WHEN completed THEN reward_coins ELSE 0 END) as earned_coins
      FROM user_daily_task udt
      JOIN daily_task_template dtt ON udt.task_type = dtt.id
      WHERE udt.user_id = ? AND udt.task_date = ?
    `, [userId, today]);

    // 獲取連續完成天數
    const [streakStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT task_date) as completed_days
      FROM user_daily_task
      WHERE user_id = ? 
        AND task_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND completed = TRUE
      GROUP BY task_date
      HAVING COUNT(*) = (SELECT COUNT(*) FROM daily_task_template)
    `, [userId]);

    res.json({
      success: true,
      stats: {
        today: todayStats[0] || { total_tasks: 0, completed_tasks: 0, earned_exp: 0, earned_coins: 0 },
        streak_days: (streakStats[0]?.completed_days || 0)
      }
    });

  } catch (error) {
    console.error('獲取每日任務統計失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  }
});

/**
 * 確保用戶今日任務存在（如果不存在則創建）
 */
async function ensureDailyTasks(userId, date) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // 獲取所有任務模板
    const [templates] = await connection.execute('SELECT * FROM daily_task_template');

    for (const template of templates) {
      // 檢查用戶今日是否已有該類型任務
      const [existing] = await connection.execute(
        'SELECT id FROM user_daily_task WHERE user_id = ? AND task_date = ? AND task_type = ?',
        [userId, date, template.id]
      );

      if (existing.length === 0) {
        // 創建今日任務
        await connection.execute(`
          INSERT INTO user_daily_task (user_id, task_date, task_type, progress, target_count, completed)
          VALUES (?, ?, ?, 0, ?, FALSE)
        `, [userId, date, template.id, template.target_count]);
      }
    }

    await connection.commit();
    
  } catch (error) {
    await connection.rollback();
    console.error('創建每日任務失敗:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export default router;