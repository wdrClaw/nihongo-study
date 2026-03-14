import { db } from '../config/database.js';

async function createRemainingTables() {
  try {
    console.log('🔄 創建剩余數據表...');

    // 創建所有缺失的表
    const tables = [
      `CREATE TABLE IF NOT EXISTS daily_task_template (
        id VARCHAR(30) PRIMARY KEY COMMENT '任務類型',
        name_cn VARCHAR(100) NOT NULL COMMENT '任務名稱',
        description_cn TEXT COMMENT '任務描述',
        target_count INT DEFAULT 1 COMMENT '目標數量',
        reward_exp INT DEFAULT 0 COMMENT '獎勵經驗',
        reward_coins INT DEFAULT 0 COMMENT '獎勵金幣',
        icon VARCHAR(100) COMMENT '圖標'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日任務模板'`,

      `CREATE TABLE IF NOT EXISTS exam_paper (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL COMMENT '試卷名稱',
        description TEXT COMMENT '說明',
        time_limit_minutes INT DEFAULT 105 COMMENT '時間限制(分鐘)',
        total_score INT DEFAULT 180 COMMENT '總分',
        pass_score INT DEFAULT 80 COMMENT '及格分',
        questions JSON NOT NULL COMMENT '題目配置',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模擬考試試卷'`,

      `CREATE TABLE IF NOT EXISTS login_reward (
        day_count INT PRIMARY KEY COMMENT '連續天數',
        reward_exp INT DEFAULT 0 COMMENT '獎勵經驗',
        reward_coins INT DEFAULT 0 COMMENT '獎勵金幣',
        reward_item VARCHAR(100) COMMENT '獎勵物品',
        special_reward VARCHAR(100) COMMENT '特殊獎勵'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='連續登入獎勵配置'`,

      `CREATE TABLE IF NOT EXISTS user_game_stats (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL COMMENT '用戶ID',
        stat_date DATE NOT NULL COMMENT '統計日期',
        play_time_minutes INT DEFAULT 0 COMMENT '遊戲時長(分鐘)',
        stages_completed INT DEFAULT 0 COMMENT '完成關卡數',
        words_learned INT DEFAULT 0 COMMENT '學習單詞數',
        voice_practice_count INT DEFAULT 0 COMMENT '語音練習次數',
        boss_defeats INT DEFAULT 0 COMMENT 'BOSS擊敗數',
        perfect_scores INT DEFAULT 0 COMMENT '滿分次數',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_date (user_id, stat_date),
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
        INDEX idx_stat_date (stat_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶遊戲統計'`
    ];

    for (const createStatement of tables) {
      console.log(`創建表: ${createStatement.substring(0, 50)}...`);
      await db.execute(createStatement);
    }

    console.log('✅ 剩余表格創建完成');
    
    // 檢查所有表
    const [allTables] = await db.execute("SHOW TABLES LIKE '%'");
    console.log('📋 所有表格:', allTables.map(t => Object.values(t)[0]));

  } catch (error) {
    console.error('❌ 創建表格失敗:', error);
  } finally {
    process.exit(0);
  }
}

createRemainingTables();