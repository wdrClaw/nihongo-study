USE nihongo_quest;

CREATE TABLE IF NOT EXISTS kana (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hiragana CHAR(1) NOT NULL COMMENT '平假名',
  katakana CHAR(1) NOT NULL COMMENT '片假名',  
  romaji VARCHAR(5) NOT NULL COMMENT '羅馬音',
  category ENUM('basic', 'dakuten', 'handakuten', 'youon') DEFAULT 'basic' COMMENT '分類',
  pronunciation_url VARCHAR(255) COMMENT '發音文件URL',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='假名數據表';

CREATE TABLE IF NOT EXISTS achievement (
  id VARCHAR(50) PRIMARY KEY COMMENT '成就ID',
  name_cn VARCHAR(100) NOT NULL COMMENT '成就名稱',
  description_cn TEXT COMMENT '成就描述',
  icon VARCHAR(100) COMMENT '圖標',
  category VARCHAR(30) COMMENT '分類',
  reward_exp INT DEFAULT 0 COMMENT '獎勵經驗',
  reward_coins INT DEFAULT 0 COMMENT '獎勵金幣',
  reward_item VARCHAR(100) COMMENT '獎勵物品',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就表';

CREATE TABLE IF NOT EXISTS boss (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) UNIQUE NOT NULL COMMENT 'BOSS代碼',
  name_cn VARCHAR(100) NOT NULL COMMENT 'BOSS名稱',
  name_jp VARCHAR(100) COMMENT '日文名稱',
  description_cn TEXT COMMENT 'BOSS描述',
  max_hp INT DEFAULT 5 COMMENT '最大生命值',
  sprite_url VARCHAR(255) COMMENT '精靈圖URL',
  attack_animation VARCHAR(100) COMMENT '攻擊動畫',
  defeat_animation VARCHAR(100) COMMENT '被擊敗動畫',
  special_abilities JSON COMMENT '特殊能力',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='BOSS數據表';

CREATE TABLE IF NOT EXISTS daily_task_template (
  id VARCHAR(30) PRIMARY KEY COMMENT '任務類型',
  name_cn VARCHAR(100) NOT NULL COMMENT '任務名稱',
  description_cn TEXT COMMENT '任務描述',
  target_count INT DEFAULT 1 COMMENT '目標數量',
  reward_exp INT DEFAULT 0 COMMENT '獎勵經驗',
  reward_coins INT DEFAULT 0 COMMENT '獎勵金幣',
  icon VARCHAR(100) COMMENT '圖標'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日任務模板';

CREATE TABLE IF NOT EXISTS exam_paper (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '試卷名稱',
  description TEXT COMMENT '說明',
  time_limit_minutes INT DEFAULT 105 COMMENT '時間限制(分鐘)',
  total_score INT DEFAULT 180 COMMENT '總分',
  pass_score INT DEFAULT 80 COMMENT '及格分',
  questions JSON NOT NULL COMMENT '題目配置',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模擬考試試卷';

CREATE TABLE IF NOT EXISTS login_reward (
  day_count INT PRIMARY KEY COMMENT '連續天數',
  reward_exp INT DEFAULT 0 COMMENT '獎勵經驗',
  reward_coins INT DEFAULT 0 COMMENT '獎勵金幣',
  reward_item VARCHAR(100) COMMENT '獎勵物品',
  special_reward VARCHAR(100) COMMENT '特殊獎勵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='連續登入獎勵配置';

CREATE TABLE IF NOT EXISTS user_game_stats (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶遊戲統計';