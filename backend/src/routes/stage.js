import express from 'express';
import { db, redis } from '../../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

/**
 * 獲取關卡配置
 * GET /api/stage/:areaId/:stageId
 */
router.get('/:areaId/:stageId', authenticateToken, async (req, res) => {
  try {
    const { areaId, stageId } = req.params;
    const userId = req.userId;
    
    console.log(`獲取關卡配置: 區域${areaId}, 關卡${stageId}, 用戶${userId}`);

    // 檢查區域和關卡ID是否有效
    if (!areaId || !stageId || isNaN(areaId) || isNaN(stageId)) {
      return res.status(400).json({
        success: false,
        message: '無效的區域或關卡ID'
      });
    }

    // 檢查關卡是否存在
    console.log('查詢關卡配置...');
    const [stageConfigs] = await db.execute(
      'SELECT * FROM stage_config WHERE area_id = ? AND stage_id = ?',
      [parseInt(areaId), parseInt(stageId)]
    );
    
    console.log(`查詢結果數量: ${stageConfigs.length}`);
    if (stageConfigs.length > 0) {
      console.log('關卡配置:', stageConfigs[0]);
    }

    if (stageConfigs.length === 0) {
      return res.status(404).json({
        success: false,
        message: '關卡不存在'
      });
    }

    const stageConfig = stageConfigs[0];
    
    console.log('原始stageConfig.config_data:', stageConfig.config_data);
    console.log('原始stageConfig.rewards:', stageConfig.rewards);
    
    // 適配字段名差異
    stageConfig.name_cn = stageConfig.title;
    stageConfig.description_cn = stageConfig.description;
    
    // 處理JSON字段
    if (typeof stageConfig.config_data === 'string') {
      stageConfig.game_config = JSON.parse(stageConfig.config_data);
    } else {
      stageConfig.game_config = stageConfig.config_data;
    }
    
    if (typeof stageConfig.rewards === 'string') {
      stageConfig.rewards = JSON.parse(stageConfig.rewards);
    }
    
    stageConfig.time_limit_seconds = stageConfig.game_config.time_limit_seconds;
    stageConfig.target_score = stageConfig.game_config.target_score;
    
    console.log('處理後的game_config:', stageConfig.game_config);

    // 檢查關卡是否已解鎖
    const isUnlocked = await checkStageUnlock(userId, areaId, stageId);
    if (!isUnlocked) {
      return res.status(403).json({
        success: false,
        message: '關卡尚未解鎖'
      });
    }

    // 獲取用戶在該關卡的進度
    const [userProgress] = await db.execute(
      'SELECT * FROM user_stage_progress WHERE user_id = ? AND area_id = ? AND stage_id = ?',
      [userId, areaId, stageId]
    );

    // 根據遊戲類型生成具體遊戲數據
    let gameData = {};
    
    switch (stageConfig.game_type) {
      case 'match_clear':
        gameData = await generateMatchClearData(stageConfig);
        break;
      case 'word_battle':
        gameData = await generateWordBattleData(stageConfig, userId);
        break;
      case 'voice_dojo':
        gameData = await generateVoiceDojoData(stageConfig);
        break;
      case 'grammar_runner':
        gameData = await generateGrammarRunnerData(stageConfig);
        break;
      case 'listening_shooter':
        gameData = await generateListeningShooterData(stageConfig);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: '未知的遊戲類型'
        });
    }

    res.json({
      success: true,
      stage: {
        ...stageConfig,
        user_progress: userProgress.length > 0 ? userProgress[0] : null,
        game_data: gameData
      }
    });

  } catch (error) {
    console.error('獲取關卡配置失敗:', error);
    console.error('錯誤堆棧:', error.stack);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * 提交關卡結果
 * POST /api/stage/:areaId/:stageId/complete
 */
router.post('/:areaId/:stageId/complete', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { areaId, stageId } = req.params;
    const { score, time_spent, answers, stars } = req.body;
    const userId = req.userId;

    // 驗證輸入
    if (score === undefined || stars === undefined || ![0, 1, 2, 3].includes(stars)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '無效的關卡結果數據'
      });
    }

    // 獲取關卡配置
    const [stageConfigs] = await connection.execute(
      'SELECT * FROM stage_config WHERE area_id = ? AND stage_id = ?',
      [parseInt(areaId), parseInt(stageId)]
    );

    if (stageConfigs.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '關卡不存在'
      });
    }

    const stageConfig = stageConfigs[0];
    const rewards = JSON.parse(stageConfig.rewards);

    // 更新或插入用戶關卡進度
    await connection.execute(`
      INSERT INTO user_stage_progress (user_id, area_id, stage_id, stars, best_score, attempts, completed_at) 
      VALUES (?, ?, ?, ?, ?, 1, NOW()) 
      ON DUPLICATE KEY UPDATE 
        stars = GREATEST(stars, VALUES(stars)),
        best_score = GREATEST(best_score, VALUES(best_score)),
        attempts = attempts + 1,
        completed_at = IF(VALUES(stars) > stars, NOW(), completed_at)
    `, [userId, areaId, stageId, stars, score]);

    // 計算獲得的獎勵（基礎獎勵 + 星級加成）
    let expGained = rewards.exp || 0;
    let coinsGained = rewards.coins || 0;
    
    // 星級加成
    if (stars === 3) {
      expGained = Math.floor(expGained * 1.5);
      coinsGained = Math.floor(coinsGained * 1.5);
    } else if (stars === 2) {
      expGained = Math.floor(expGained * 1.2);
      coinsGained = Math.floor(coinsGained * 1.2);
    }

    // 更新用戶經驗和金幣
    await connection.execute(
      'UPDATE user SET exp = exp + ?, coins = coins + ? WHERE id = ?',
      [expGained, coinsGained, userId]
    );

    // 更新每日任務進度
    await updateDailyTaskProgress(connection, userId, 'complete_stage', 1);

    // 檢查成就
    await checkAchievements(connection, userId, {
      type: 'stage_complete',
      areaId: parseInt(areaId),
      stageId: parseInt(stageId),
      stars,
      score
    });

    await connection.commit();

    res.json({
      success: true,
      progress: {
        area_id: parseInt(areaId),
        stage_id: parseInt(stageId),
        stars,
        best_score: score
      },
      rewards: {
        exp: expGained,
        coins: coinsGained,
        items: rewards.items || []
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('提交關卡結果失敗:', error);
    res.status(500).json({
      success: false,
      message: '服務器內部錯誤'
    });
  } finally {
    connection.release();
  }
});

/**
 * 獲取假名消消樂數據
 */
async function generateMatchClearData(stageConfig) {
  const config = JSON.parse(stageConfig.game_config);
  
  if (config.pairs === "mixed_all_kana") {
    // 極限模式：隨機選擇假名
    const [kanas] = await db.execute('SELECT * FROM kana ORDER BY RAND() LIMIT 16');
    return {
      pairs: kanas.map(k => ({
        hiragana: k.hiragana,
        katakana: k.katakana,
        romaji: k.romaji
      })),
      mode: config.mode,
      grid_size: config.grid_size
    };
  } else {
    // 使用配置中的固定假名對
    return {
      pairs: config.pairs,
      mode: config.mode,
      grid_size: config.grid_size
    };
  }
}

/**
 * 獲取單詞BOSS戰數據
 */
async function generateWordBattleData(stageConfig, userId) {
  const config = JSON.parse(stageConfig.game_config);
  
  // 獲取BOSS信息
  const [bosses] = await db.execute('SELECT * FROM boss WHERE code = ?', [config.boss]);
  const boss = bosses[0];
  
  // 獲取該類別的單詞
  const categories = config.word_category;
  const questionCount = config.questions || 8;
  
  // 獲取用戶的單詞學習記錄，優先選擇需要復習的單詞
  const [words] = await db.execute(`
    SELECT w.*, 
           COALESCE(uv.mastery_level, 0) as user_mastery,
           COALESCE(uv.wrong_count, 0) as wrong_count
    FROM word w 
    LEFT JOIN user_vocabulary uv ON w.id = uv.word_id AND uv.user_id = ?
    WHERE w.category IN (${categories.map(() => '?').join(',')})
    ORDER BY 
      CASE 
        WHEN uv.next_review IS NOT NULL AND uv.next_review <= NOW() THEN 0  -- 需要復習
        WHEN uv.wrong_count > 0 THEN 1  -- 之前答錯
        WHEN uv.mastery_level IS NULL THEN 2  -- 新單詞
        ELSE 3  -- 已掌握
      END,
      RAND()
    LIMIT ?
  `, [userId, ...categories, questionCount]);
  
  // 為每個單詞生成干擾選項
  const questions = [];
  for (const word of words) {
    // 獲取同類別的其他單詞作為干擾項
    const [distractors] = await db.execute(`
      SELECT chinese FROM word 
      WHERE category = ? AND id != ? 
      ORDER BY RAND() 
      LIMIT 3
    `, [word.category, word.id]);
    
    const options = [
      word.chinese,
      ...distractors.map(d => d.chinese)
    ].sort(() => Math.random() - 0.5);  // 隨機排序
    
    questions.push({
      id: word.id,
      japanese: word.japanese,
      hiragana: word.hiragana,
      correct_answer: word.chinese,
      options: options,
      audio_url: word.audio_url
    });
  }
  
  return {
    boss: boss,
    questions: questions,
    time_per_question: config.time_per_question || 8
  };
}

/**
 * 獲取語音道場數據
 */
async function generateVoiceDojoData(stageConfig) {
  const config = JSON.parse(stageConfig.game_config);
  
  if (config.practice_type === 'kana_reading') {
    // 假名跟讀
    const [kanas] = await db.execute(`
      SELECT hiragana, romaji FROM kana 
      WHERE hiragana IN (${config.kanas.map(() => '?').join(',')})
    `, config.kanas);
    
    return {
      practice_type: config.practice_type,
      items: kanas,
      passing_score: config.passing_score || 60
    };
  }
  
  return config;
}

/**
 * 獲取語法跑酷數據
 */
async function generateGrammarRunnerData(stageConfig) {
  const config = JSON.parse(stageConfig.game_config);
  
  // 這裡可以根據關卡配置生成語法練習數據
  // 暫時返回基礎配置
  return config;
}

/**
 * 獲取聽力射擊數據
 */
async function generateListeningShooterData(stageConfig) {
  const config = JSON.parse(stageConfig.game_config);
  
  // 這裡可以根據關卡配置生成聽力練習數據
  // 暫時返回基礎配置
  return config;
}

/**
 * 檢查關卡是否解鎖
 */
async function checkStageUnlock(userId, areaId, stageId) {
  // 第一個區域的第一關默認解鎖
  if (parseInt(areaId) === 1 && parseInt(stageId) === 1) {
    return true;
  }
  
  // 檢查前一關是否完成
  if (parseInt(stageId) > 1) {
    const [prevStage] = await db.execute(
      'SELECT stars FROM user_stage_progress WHERE user_id = ? AND area_id = ? AND stage_id = ?',
      [userId, areaId, parseInt(stageId) - 1]
    );
    return prevStage.length > 0 && prevStage[0].stars > 0;
  }
  
  // 檢查前一個區域是否有足夠星星
  const [prevAreaStars] = await db.execute(
    'SELECT SUM(stars) as total_stars FROM user_stage_progress WHERE user_id = ? AND area_id = ?',
    [userId, parseInt(areaId) - 1]
  );
  
  const requiredStars = Math.ceil(8 * 2.1); // 需要約17星
  return prevAreaStars.length > 0 && (prevAreaStars[0].total_stars || 0) >= requiredStars;
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

/**
 * 檢查成就解鎖
 */
async function checkAchievements(connection, userId, event) {
  // 根據事件類型檢查不同成就
  if (event.type === 'stage_complete') {
    // 檢查「第一步」成就
    if (event.areaId === 1 && event.stageId === 1) {
      await unlockAchievement(connection, userId, 'first_step');
    }
    
    // 檢查「完美射手」成就
    if (event.stars === 3) {
      await unlockAchievement(connection, userId, 'perfect_shooter');
    }
  }
}

/**
 * 解鎖成就
 */
async function unlockAchievement(connection, userId, achievementId) {
  try {
    // 檢查是否已解鎖
    const [existing] = await connection.execute(
      'SELECT id FROM user_achievement WHERE user_id = ? AND achievement_id = ?',
      [userId, achievementId]
    );
    
    if (existing.length > 0) {
      return; // 已解鎖
    }
    
    // 解鎖成就
    await connection.execute(
      'INSERT INTO user_achievement (user_id, achievement_id) VALUES (?, ?)',
      [userId, achievementId]
    );
    
    // 獲取成就獎勵
    const [achievement] = await connection.execute(
      'SELECT * FROM achievement WHERE id = ?',
      [achievementId]
    );
    
    if (achievement.length > 0) {
      const reward = achievement[0];
      await connection.execute(
        'UPDATE user SET exp = exp + ?, coins = coins + ? WHERE id = ?',
        [reward.reward_exp, reward.reward_coins, userId]
      );
    }
    
  } catch (error) {
    console.error('解鎖成就失敗:', error);
  }
}

export default router;