-- Nihongo Quest 數據庫表結構
-- 創建時間：2026-03-14
-- 版本：v2.0

USE nihongo_quest;

-- 用戶表（已有基礎結構，補充字段）
CREATE TABLE IF NOT EXISTS user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用戶名',
  password_hash VARCHAR(255) NOT NULL COMMENT '密碼哈希',
  nickname VARCHAR(50) COMMENT '昵稱',
  email VARCHAR(100) UNIQUE COMMENT '郵箱',
  avatar VARCHAR(255) DEFAULT 'default.png' COMMENT '頭像',
  level INT DEFAULT 1 COMMENT '等級',
  exp INT DEFAULT 0 COMMENT '經驗值',
  coins INT DEFAULT 100 COMMENT '金幣',
  diamonds INT DEFAULT 0 COMMENT '鑽石',
  consecutive_days INT DEFAULT 0 COMMENT '連續登入天數',
  last_login_date DATE COMMENT '最後登入日期',
  character_gender ENUM('male', 'female') DEFAULT 'female' COMMENT '角色性別',
  character_hair VARCHAR(50) DEFAULT 'default' COMMENT '髮型',
  character_outfit VARCHAR(50) DEFAULT 'default' COMMENT '服裝',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_level (level),
  INDEX idx_exp (exp),
  INDEX idx_last_login (last_login_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶表';

-- 關卡進度表
CREATE TABLE IF NOT EXISTS user_stage_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用戶ID',
  area_id TINYINT NOT NULL COMMENT '區域ID (1-6)',
  stage_id TINYINT NOT NULL COMMENT '關卡ID',
  stars TINYINT DEFAULT 0 COMMENT '星級 (0-3)',
  best_score INT DEFAULT 0 COMMENT '最佳分數',
  attempts INT DEFAULT 0 COMMENT '嘗試次數',
  completed_at DATETIME COMMENT '完成時間',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_stage (user_id, area_id, stage_id),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_area_stage (area_id, stage_id),
  INDEX idx_stars (stars)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶關卡進度';

-- 假名數據表
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

-- 單詞表
CREATE TABLE IF NOT EXISTS word (
  id INT PRIMARY KEY AUTO_INCREMENT,
  japanese VARCHAR(50) NOT NULL COMMENT '日語原文',
  hiragana VARCHAR(50) COMMENT '假名讀音',
  chinese VARCHAR(100) NOT NULL COMMENT '中文含義',
  category VARCHAR(30) NOT NULL COMMENT '分類',
  jlpt_level VARCHAR(5) DEFAULT 'N5' COMMENT 'JLPT等級',
  difficulty TINYINT DEFAULT 1 COMMENT '難度 (1-5)',
  audio_url VARCHAR(255) COMMENT '發音文件URL',
  image_url VARCHAR(255) COMMENT '配圖URL',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_difficulty (difficulty),
  INDEX idx_jlpt_level (jlpt_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='單詞表';

-- 語法表
CREATE TABLE IF NOT EXISTS grammar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pattern VARCHAR(100) NOT NULL COMMENT '語法句型',
  meaning_cn VARCHAR(200) NOT NULL COMMENT '中文含義',
  explanation TEXT COMMENT '詳細說明',
  category VARCHAR(30) NOT NULL COMMENT '分類',
  difficulty TINYINT DEFAULT 1 COMMENT '難度 (1-5)',
  examples JSON COMMENT '例句列表',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='語法表';

-- 用戶單詞學習記錄（SRS）
CREATE TABLE IF NOT EXISTS user_vocabulary (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用戶ID',
  word_id INT NOT NULL COMMENT '單詞ID',
  correct_count INT DEFAULT 0 COMMENT '正確次數',
  wrong_count INT DEFAULT 0 COMMENT '錯誤次數',
  last_review DATETIME COMMENT '最後復習時間',
  next_review DATETIME COMMENT 'SRS下次復習時間',
  mastery_level TINYINT DEFAULT 0 COMMENT '掌握程度 (0-4)',
  ease_factor FLOAT DEFAULT 2.5 COMMENT 'SRS難度係數',
  interval_days TINYINT DEFAULT 1 COMMENT 'SRS間隔天數',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_word (user_id, word_id),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES word(id) ON DELETE CASCADE,
  INDEX idx_next_review (next_review),
  INDEX idx_mastery (mastery_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶單詞學習記錄';

-- 用戶語法學習記錄
CREATE TABLE IF NOT EXISTS user_grammar (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用戶ID',
  grammar_id INT NOT NULL COMMENT '語法ID',
  mastery_level TINYINT DEFAULT 0 COMMENT '掌握程度 (0-4)',
  practice_count INT DEFAULT 0 COMMENT '練習次數',
  last_practice DATETIME COMMENT '最後練習時間',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_grammar (user_id, grammar_id),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (grammar_id) REFERENCES grammar(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶語法學習記錄';

-- 成就表
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

-- 用戶成就解鎖記錄
CREATE TABLE IF NOT EXISTS user_achievement (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用戶ID',
  achievement_id VARCHAR(50) NOT NULL COMMENT '成就ID',
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '解鎖時間',
  UNIQUE KEY uk_user_achievement (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievement(id) ON DELETE CASCADE,
  INDEX idx_unlocked_at (unlocked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶成就記錄';

-- 每日任務模板
CREATE TABLE IF NOT EXISTS daily_task_template (
  id VARCHAR(30) PRIMARY KEY COMMENT '任務類型',
  name_cn VARCHAR(100) NOT NULL COMMENT '任務名稱',
  description_cn TEXT COMMENT '任務描述',
  target_count INT DEFAULT 1 COMMENT '目標數量',
  reward_exp INT DEFAULT 0 COMMENT '獎勵經驗',
  reward_coins INT DEFAULT 0 COMMENT '獎勵金幣',
  icon VARCHAR(100) COMMENT '圖標'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日任務模板';

-- 用戶每日任務完成記錄
CREATE TABLE IF NOT EXISTS user_daily_task (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用戶ID',
  task_date DATE NOT NULL COMMENT '任務日期',
  task_type VARCHAR(30) NOT NULL COMMENT '任務類型',
  progress INT DEFAULT 0 COMMENT '當前進度',
  target_count INT NOT NULL COMMENT '目標數量',
  completed BOOLEAN DEFAULT FALSE COMMENT '是否完成',
  completed_at DATETIME COMMENT '完成時間',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_task (user_id, task_date, task_type),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (task_type) REFERENCES daily_task_template(id) ON DELETE CASCADE,
  INDEX idx_task_date (task_date),
  INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶每日任務記錄';

-- 模擬考試試卷
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

-- 用戶模擬考試記錄
CREATE TABLE IF NOT EXISTS user_exam_result (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用戶ID',
  exam_paper_id INT NOT NULL COMMENT '試卷ID',
  vocabulary_score INT COMMENT '詞彙分數',
  grammar_reading_score INT COMMENT '語法閱讀分數',
  listening_score INT COMMENT '聽力分數',
  total_score INT COMMENT '總分',
  pass BOOLEAN COMMENT '是否通過',
  time_spent_minutes INT COMMENT '用時(分鐘)',
  answers JSON COMMENT '答題詳情',
  taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_paper_id) REFERENCES exam_paper(id) ON DELETE CASCADE,
  INDEX idx_taken_at (taken_at),
  INDEX idx_total_score (total_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶考試記錄';

-- 關卡配置表
CREATE TABLE IF NOT EXISTS stage_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  area_id TINYINT NOT NULL COMMENT '區域ID',
  stage_id TINYINT NOT NULL COMMENT '關卡ID',
  name_cn VARCHAR(100) NOT NULL COMMENT '關卡名稱',
  description_cn TEXT COMMENT '關卡描述',
  game_type ENUM('match_clear', 'word_battle', 'voice_dojo', 'grammar_runner', 'listening_shooter') NOT NULL COMMENT '遊戲類型',
  difficulty TINYINT DEFAULT 1 COMMENT '難度等級',
  time_limit_seconds INT COMMENT '時間限制(秒)',
  target_score INT COMMENT '目標分數',
  unlock_requirements JSON COMMENT '解鎖條件',
  game_config JSON NOT NULL COMMENT '遊戲配置',
  rewards JSON COMMENT '獎勵配置',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_area_stage (area_id, stage_id),
  INDEX idx_game_type (game_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='關卡配置表';

-- BOSS數據表
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

-- 連續登入獎勵配置
CREATE TABLE IF NOT EXISTS login_reward (
  day_count INT PRIMARY KEY COMMENT '連續天數',
  reward_exp INT DEFAULT 0 COMMENT '獎勵經驗',
  reward_coins INT DEFAULT 0 COMMENT '獎勵金幣',
  reward_item VARCHAR(100) COMMENT '獎勵物品',
  special_reward VARCHAR(100) COMMENT '特殊獎勵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='連續登入獎勵配置';

-- 用戶遊戲統計
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

-- 觸發器：自動更新用戶等級（暫時移除，由應用層處理）
-- CREATE TRIGGER update_user_level 
-- BEFORE UPDATE ON user 
-- FOR EACH ROW 
-- BEGIN
--   DECLARE new_level INT;
--   -- 根據經驗值計算等級邏輯移到應用層處理
-- END;