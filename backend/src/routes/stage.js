import express from 'express';
import { db, redis } from '../../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

/**
 * 獲取區域所有關卡列表
 * GET /api/stage/area/:areaId
 */
router.get('/area/:areaId', authenticateToken, async (req, res) => {
  try {
    const { areaId } = req.params;
    const userId = req.userId;

    // 查詢該區域所有關卡
    const [stages] = await db.execute(
      'SELECT id, area_id, stage_id, title, description, game_type FROM stage_config WHERE area_id = ? ORDER BY stage_id',
      [areaId]
    );

    // 查詢用戶在該區域的進度
    const [progresses] = await db.execute(
      'SELECT stage_id, stars, best_score, attempts, completed_at FROM user_stage_progress WHERE user_id = ? AND area_id = ?',
      [userId, areaId]
    );

    const progressMap = {};
    progresses.forEach(p => { progressMap[p.stage_id] = p; });

    // 組裝關卡數據
    const result = stages.map(stage => {
      const progress = progressMap[stage.stage_id];
      // 解鎖邏輯：第1關始終解鎖，後續關需要前一關完成
      let unlocked = stage.stage_id === 1;
      if (stage.stage_id > 1) {
        const prevProgress = progressMap[stage.stage_id - 1];
        unlocked = prevProgress && prevProgress.stars > 0;
      }
      return {
        stage_id: stage.stage_id,
        name_cn: stage.title,
        description_cn: stage.description || '',
        game_type: stage.game_type,
        unlocked,
        stars: progress?.stars || 0,
        best_score: progress?.best_score || 0,
        attempts: progress?.attempts || 0,
        completed_at: progress?.completed_at || null
      };
    });

    res.json({ success: true, stages: result });
  } catch (error) {
    console.error('獲取區域關卡列表失敗:', error);
    res.status(500).json({ success: false, message: '伺服器內部錯誤' });
  }
});

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
      stageConfig.game_config = typeof stageConfig.config_data === "string" ? JSON.parse(stageConfig.config_data) : stageConfig.config_data;
    } else {
      stageConfig.game_config = stageConfig.config_data;
    }
    
    if (typeof stageConfig.rewards === 'string') {
      stageConfig.rewards = typeof stageConfig.rewards === "string" ? JSON.parse(stageConfig.rewards) : stageConfig.rewards;
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
    
    try {
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
    } catch (gameDataError) {
      console.error('生成遊戲數據失敗:', gameDataError);
      // 使用配置數據作為降級方案
      gameData = stageConfig.game_config || {};
    }

    console.log('最終gameData:', JSON.stringify(gameData, null, 2));

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
    const rewards = typeof stageConfig.rewards === "string" ? JSON.parse(stageConfig.rewards) : stageConfig.rewards;

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
  try {
    const config = typeof stageConfig.game_config === 'string' ? JSON.parse(stageConfig.game_config) : stageConfig.game_config;
    
    console.log('generateMatchClearData 輸入配置:', JSON.stringify(config, null, 2));
    
    if (config.pairs === "mixed_all_kana") {
      // 極限模式：隨機選擇假名
      const [kanas] = await db.execute('SELECT * FROM kana ORDER BY RAND() LIMIT 16');
      if (kanas.length === 0) {
        // 如果 kana 表為空，使用基礎假名
        console.warn('kana表為空，使用預設假名');
        const basicPairs = [
          {hiragana: "あ", katakana: "ア", romaji: "a"}, {hiragana: "い", katakana: "イ", romaji: "i"},
          {hiragana: "う", katakana: "ウ", romaji: "u"}, {hiragana: "え", katakana: "エ", romaji: "e"},
          {hiragana: "お", katakana: "オ", romaji: "o"}, {hiragana: "か", katakana: "カ", romaji: "ka"},
          {hiragana: "き", katakana: "キ", romaji: "ki"}, {hiragana: "く", katakana: "ク", romaji: "ku"},
        ];
        return { pairs: basicPairs, mode: config.mode, grid_size: config.grid_size };
      }
      
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
        pairs: config.pairs || [],
        mode: config.mode,
        grid_size: config.grid_size
      };
    }
  } catch (error) {
    console.error('generateMatchClearData 錯誤:', error);
    // 返回基礎數據作為降級方案
    return {
      pairs: [
        {hiragana: "あ", katakana: "ア", romaji: "a"}, {hiragana: "い", katakana: "イ", romaji: "i"},
        {hiragana: "う", katakana: "ウ", romaji: "u"}, {hiragana: "え", katakana: "エ", romaji: "e"}
      ],
      mode: "basic",
      grid_size: "4x4"
    };
  }
}

/**
 * 獲取單詞BOSS戰數據
 */
async function generateWordBattleData(stageConfig, userId) {
  const config = typeof stageConfig.game_config === "string" ? JSON.parse(stageConfig.game_config) : stageConfig.game_config;
  
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
  const config = typeof stageConfig.game_config === "string" ? JSON.parse(stageConfig.game_config) : stageConfig.game_config;
  
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
  const config = typeof stageConfig.game_config === "string" ? JSON.parse(stageConfig.game_config) : stageConfig.game_config;
  
  try {
    // 根據難度獲取語法點
    const difficulty = config.difficulty || 1;
    const [grammarPoints] = await db.execute(`
      SELECT pattern, meaning_cn, examples, category
      FROM grammar 
      WHERE difficulty <= ? AND category IN ('basic_sentence', 'verb', 'adjective')
      ORDER BY difficulty, RAND()
      LIMIT 5
    `, [difficulty]);
    
    // 為每個語法點生成句子練習
    const sentences = [];
    for (const grammar of grammarPoints) {
      const examples = typeof grammar.examples === 'string' ? JSON.parse(grammar.examples) : grammar.examples;
      if (examples && examples.length > 0) {
        // 選擇第一個例句並解析
        const example = examples[0];
        const parts = example.split('(');
        const japanese = parts[0].trim();
        const chinese = parts[1] ? parts[1].replace(')', '').trim() : '';
        
        // 簡單分詞（實際項目中可能需要更複雜的分詞邏輯）
        const japaneseWords = japanese.split(/[。、\s]+/).filter(word => word.length > 0);
        
        // 生成干擾項
        const distractors = await generateDistractors(japaneseWords, grammar.category);
        
        sentences.push({
          chinese: chinese,
          japanese_words: japaneseWords,
          distractors: distractors,
          grammar_point: grammar.pattern
        });
      }
    }
    
    return {
      sentences: sentences.length > 0 ? sentences : [{
        chinese: "我在學校學日語",
        japanese_words: ["私は", "学校で", "日本語を", "勉強します"],
        distractors: ["勉強しません", "学校に", "日本語が"],
        grammar_point: "基礎句型"
      }],
      difficulty: difficulty,
      mode: config.mode || 'normal'
    };
  } catch (error) {
    console.error('生成語法跑酷數據失敗:', error);
    // 返回默認數據
    return {
      sentences: [{
        chinese: "我在學校學日語",
        japanese_words: ["私は", "学校で", "日本語を", "勉強します"],
        distractors: ["勉強しません", "学校に", "日本語が"],
        grammar_point: "基礎句型"
      }],
      difficulty: 1,
      mode: 'normal'
    };
  }
}

/**
 * 生成語法跑酷的干擾項
 */
async function generateDistractors(correctWords, category) {
  try {
    // 根據分類獲取干擾詞
    const [words] = await db.execute(`
      SELECT japanese FROM word 
      WHERE category IN ('verb', 'adjective') 
      AND japanese NOT IN (${correctWords.map(() => '?').join(',')})
      ORDER BY RAND() 
      LIMIT 3
    `, correctWords);
    
    return words.map(w => w.japanese);
  } catch (error) {
    // 返回默認干擾項
    return ["間違い", "違う", "だめ"];
  }
}

/**
 * 獲取聽力射擊數據
 */
async function generateListeningShooterData(stageConfig) {
  const config = typeof stageConfig.game_config === "string" ? JSON.parse(stageConfig.game_config) : stageConfig.game_config;
  
  try {
    const scene = config.scene || 'convenience_store';
    const difficulty = config.difficulty || 1;
    
    // 根據場景和難度生成問題
    const sceneCategories = {
      'convenience_store': ['food', 'number'],
      'station': ['place', 'time'], 
      'restaurant': ['food', 'adjective'],
      'phone': ['family', 'verb']
    };
    
    const categories = sceneCategories[scene] || ['food', 'verb'];
    
    // 獲取相關詞彙和常用短語
    const [words] = await db.execute(`
      SELECT japanese, hiragana, chinese, category
      FROM word 
      WHERE category IN (${categories.map(() => '?').join(',')})
      AND difficulty <= ?
      ORDER BY RAND()
      LIMIT 8
    `, [...categories, difficulty]);
    
    // 生成聽力問題
    const questions = [];
    const commonPhrases = getScenePhrases(scene);
    
    // 添加場景常用語
    commonPhrases.forEach(phrase => {
      questions.push({
        audio_url: phrase.audio_url || '',
        text: phrase.japanese,
        prompt: '請點擊正確的中文意思',
        options: [phrase.chinese, ...generateRandomOptions(phrase.chinese, 3)],
        correct_answer: phrase.chinese,
        type: 'phrase'
      });
    });
    
    // 添加詞彙問題
    words.slice(0, 4).forEach(word => {
      const wrongOptions = words
        .filter(w => w.id !== word.id && w.category === word.category)
        .slice(0, 3)
        .map(w => w.chinese);
      
      questions.push({
        audio_url: word.audio_url || '',
        text: word.japanese,
        prompt: '請點擊正確的中文意思',
        options: [word.chinese, ...wrongOptions].sort(() => Math.random() - 0.5),
        correct_answer: word.chinese,
        type: 'vocabulary'
      });
    });
    
    return {
      scene: scene,
      difficulty: difficulty,
      questions: questions.slice(0, 6), // 限制為6個問題
      balloon_count: config.balloon_count || 5,
      time_per_question: config.time_per_question || 10
    };
  } catch (error) {
    console.error('生成聽力射擊數據失敗:', error);
    // 返回默認數據
    return {
      scene: 'convenience_store',
      difficulty: 1,
      questions: [{
        audio_url: '',
        text: 'いらっしゃいませ',
        prompt: '請點擊正確的中文意思',
        options: ['歡迎光臨', '謝謝', '再見', '不好意思'],
        correct_answer: '歡迎光臨'
      }],
      balloon_count: 5,
      time_per_question: 10
    };
  }
}

/**
 * 獲取場景常用短語
 */
function getScenePhrases(scene) {
  const phrases = {
    'convenience_store': [
      { japanese: 'いらっしゃいませ', chinese: '歡迎光臨' },
      { japanese: 'ありがとうございます', chinese: '謝謝' },
      { japanese: 'レジ袋はいりますか', chinese: '需要塑料袋嗎' }
    ],
    'station': [
      { japanese: 'すみません', chinese: '不好意思' },
      { japanese: 'どこですか', chinese: '在哪裡' },
      { japanese: '電車が来ます', chinese: '電車來了' }
    ],
    'restaurant': [
      { japanese: 'いらっしゃいませ', chinese: '歡迎光臨' },
      { japanese: 'メニューをください', chinese: '請給我菜單' },
      { japanese: 'おいしいです', chinese: '很好吃' }
    ],
    'phone': [
      { japanese: 'もしもし', chinese: '喂' },
      { japanese: 'お元気ですか', chinese: '你好嗎' },
      { japanese: 'また後で', chinese: '待會再聯繫' }
    ]
  };
  
  return phrases[scene] || phrases['convenience_store'];
}

/**
 * 生成隨機干擾選項
 */
function generateRandomOptions(correctAnswer, count) {
  const commonOptions = [
    '謝謝', '不好意思', '再見', '你好', '是的', '不是', '很好', '不錯', 
    '美味', '便宜', '貴', '大', '小', '新的', '舊的', '快', '慢'
  ];
  
  const options = commonOptions.filter(option => option !== correctAnswer);
  const result = [];
  
  for (let i = 0; i < count && i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * options.length);
    const option = options.splice(randomIndex, 1)[0];
    result.push(option);
  }
  
  return result;
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
  
  // 簡化版本：直接標記為完成
  await connection.execute(`
    INSERT INTO user_daily_task (user_id, task_date, task_type, completed, completed_at)
    VALUES (?, ?, ?, TRUE, NOW())
    ON DUPLICATE KEY UPDATE
      completed = TRUE,
      completed_at = NOW()
  `, [userId, today, taskType]);
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