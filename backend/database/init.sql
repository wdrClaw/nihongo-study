-- Nihongo Quest 數據庫初始化腳本
-- 創建日期: 2026-03-14
-- 數據庫名: nihongo_quest

-- 設置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===================================
-- 1. 用戶相關表
-- ===================================

-- 用戶表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用戶ID',
  `username` VARCHAR(50) UNIQUE NOT NULL COMMENT '用戶名',
  `email` VARCHAR(100) UNIQUE COMMENT '郵箱',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密碼哈希',
  `nickname` VARCHAR(50) COMMENT '昵稱',
  `avatar` VARCHAR(255) DEFAULT 'default.png' COMMENT '頭像',
  `level` INT DEFAULT 1 COMMENT '等級',
  `exp` INT DEFAULT 0 COMMENT '經驗值',
  `coins` INT DEFAULT 0 COMMENT '金幣',
  `diamonds` INT DEFAULT 0 COMMENT '鑽石',
  `consecutive_days` INT DEFAULT 0 COMMENT '連續登入天數',
  `last_login_date` DATE COMMENT '最後登入日期',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  INDEX `idx_username` (`username`),
  INDEX `idx_level` (`level`),
  INDEX `idx_last_login` (`last_login_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶表';

-- 關卡進度表
DROP TABLE IF EXISTS `user_stage_progress`;
CREATE TABLE `user_stage_progress` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '記錄ID',
  `user_id` BIGINT NOT NULL COMMENT '用戶ID',
  `area_id` INT NOT NULL COMMENT '區域ID(1-6: 五十音島/單詞村/語法城/會話廣場/讀解森林/試煉塔)',
  `stage_id` INT NOT NULL COMMENT '關卡序號',
  `stars` INT DEFAULT 0 COMMENT '星級(0-3)',
  `best_score` INT DEFAULT 0 COMMENT '最佳分數',
  `attempts` INT DEFAULT 0 COMMENT '嘗試次數',
  `completed_at` DATETIME COMMENT '首次完成時間',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  UNIQUE KEY `uk_user_stage` (`user_id`, `area_id`, `stage_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_area_stage` (`area_id`, `stage_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='關卡進度表';

-- ===================================
-- 2. 學習內容相關表
-- ===================================

-- 單詞學習記錄 (SRS - 間隔重複系統)
DROP TABLE IF EXISTS `user_vocabulary`;
CREATE TABLE `user_vocabulary` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '記錄ID',
  `user_id` BIGINT NOT NULL COMMENT '用戶ID',
  `word_id` INT NOT NULL COMMENT '單詞ID',
  `correct_count` INT DEFAULT 0 COMMENT '正確次數',
  `wrong_count` INT DEFAULT 0 COMMENT '錯誤次數',
  `last_review` DATETIME COMMENT '最後復習時間',
  `next_review` DATETIME COMMENT 'SRS下次復習時間',
  `mastery_level` INT DEFAULT 0 COMMENT '掌握程度(0=新詞 1=認識 2=熟悉 3=掌握)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '首次學習時間',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  UNIQUE KEY `uk_user_word` (`user_id`, `word_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_next_review` (`next_review`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='單詞學習記錄表';

-- 語法學習記錄
DROP TABLE IF EXISTS `user_grammar`;
CREATE TABLE `user_grammar` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '記錄ID',
  `user_id` BIGINT NOT NULL COMMENT '用戶ID',
  `grammar_id` INT NOT NULL COMMENT '語法ID',
  `mastery_level` INT DEFAULT 0 COMMENT '掌握程度(0=未學 1=認識 2=熟悉 3=掌握)',
  `practice_count` INT DEFAULT 0 COMMENT '練習次數',
  `last_practice` DATETIME COMMENT '最後練習時間',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '首次學習時間',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  UNIQUE KEY `uk_user_grammar` (`user_id`, `grammar_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='語法學習記錄表';

-- ===================================
-- 3. 成就和任務表
-- ===================================

-- 成就表
DROP TABLE IF EXISTS `user_achievement`;
CREATE TABLE `user_achievement` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '記錄ID',
  `user_id` BIGINT NOT NULL COMMENT '用戶ID',
  `achievement_id` VARCHAR(50) NOT NULL COMMENT '成就ID',
  `unlocked_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '解鎖時間',
  UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_achievement_id` (`achievement_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就表';

-- 每日任務完成記錄
DROP TABLE IF EXISTS `user_daily_task`;
CREATE TABLE `user_daily_task` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '記錄ID',
  `user_id` BIGINT NOT NULL COMMENT '用戶ID',
  `task_date` DATE NOT NULL COMMENT '任務日期',
  `task_type` VARCHAR(30) NOT NULL COMMENT '任務類型(new_words/stage/voice/review)',
  `completed` BOOLEAN DEFAULT FALSE COMMENT '是否完成',
  `completed_at` DATETIME COMMENT '完成時間',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  UNIQUE KEY `uk_user_task` (`user_id`, `task_date`, `task_type`),
  INDEX `idx_user_date` (`user_id`, `task_date`),
  INDEX `idx_task_date` (`task_date`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日任務表';

-- ===================================
-- 4. 考試和測評表
-- ===================================

-- 模擬考試成績
DROP TABLE IF EXISTS `user_exam_result`;
CREATE TABLE `user_exam_result` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '記錄ID',
  `user_id` BIGINT NOT NULL COMMENT '用戶ID',
  `exam_set_id` INT NOT NULL COMMENT '試題套裝ID(1-3)',
  `vocabulary_score` INT COMMENT '文字語彙分數',
  `grammar_reading_score` INT COMMENT '文法讀解分數',
  `listening_score` INT COMMENT '聽解分數',
  `total_score` INT COMMENT '總分',
  `pass` BOOLEAN COMMENT '是否通過(80分以上)',
  `details` JSON COMMENT '答題詳情',
  `taken_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '考試時間',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_exam_set` (`exam_set_id`),
  INDEX `idx_taken_at` (`taken_at`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模擬考試成績表';

-- ===================================
-- 5. 題庫內容表
-- ===================================

-- 單詞題庫
DROP TABLE IF EXISTS `word`;
CREATE TABLE `word` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '單詞ID',
  `japanese` VARCHAR(50) NOT NULL COMMENT '日語原文',
  `hiragana` VARCHAR(50) COMMENT '假名讀音',
  `chinese` VARCHAR(100) NOT NULL COMMENT '中文含義',
  `category` VARCHAR(30) COMMENT '分類(food/animal/verb/adj等)',
  `jlpt_level` VARCHAR(5) DEFAULT 'N5' COMMENT 'JLPT等級',
  `audio_url` VARCHAR(255) COMMENT '音頻文件路徑',
  `image_url` VARCHAR(255) COMMENT '圖片文件路徑',
  `frequency` INT DEFAULT 0 COMMENT '使用頻率',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  INDEX `idx_category` (`category`),
  INDEX `idx_jlpt_level` (`jlpt_level`),
  INDEX `idx_frequency` (`frequency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='單詞題庫表';

-- 語法題庫
DROP TABLE IF EXISTS `grammar`;
CREATE TABLE `grammar` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '語法ID',
  `pattern` VARCHAR(100) NOT NULL COMMENT '語法句型',
  `meaning_cn` VARCHAR(200) COMMENT '中文含義',
  `explanation` TEXT COMMENT '詳細說明',
  `category` VARCHAR(30) COMMENT '分類',
  `examples` JSON COMMENT '例句列表',
  `difficulty` INT DEFAULT 1 COMMENT '難度等級(1-5)',
  `jlpt_level` VARCHAR(5) DEFAULT 'N5' COMMENT 'JLPT等級',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  INDEX `idx_category` (`category`),
  INDEX `idx_difficulty` (`difficulty`),
  INDEX `idx_jlpt_level` (`jlpt_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='語法題庫表';

-- ===================================
-- 6. 遊戲配置表
-- ===================================

-- 關卡配置
DROP TABLE IF EXISTS `stage_config`;
CREATE TABLE `stage_config` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  `area_id` INT NOT NULL COMMENT '區域ID',
  `stage_id` INT NOT NULL COMMENT '關卡ID',
  `title` VARCHAR(100) NOT NULL COMMENT '關卡標題',
  `description` TEXT COMMENT '關卡描述',
  `game_type` VARCHAR(30) NOT NULL COMMENT '遊戲類型(match/boss/runner/voice/shooter/exam)',
  `config_data` JSON COMMENT '遊戲配置數據',
  `unlock_condition` JSON COMMENT '解鎖條件',
  `rewards` JSON COMMENT '獎勵配置',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否激活',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
  UNIQUE KEY `uk_area_stage` (`area_id`, `stage_id`),
  INDEX `idx_area_id` (`area_id`),
  INDEX `idx_game_type` (`game_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='關卡配置表';

-- 商城物品
DROP TABLE IF EXISTS `shop_item`;
CREATE TABLE `shop_item` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '物品ID',
  `name` VARCHAR(50) NOT NULL COMMENT '物品名稱',
  `type` VARCHAR(30) NOT NULL COMMENT '物品類型(costume/skin/avatar等)',
  `description` TEXT COMMENT '物品描述',
  `price_coins` INT DEFAULT 0 COMMENT '金幣價格',
  `price_diamonds` INT DEFAULT 0 COMMENT '鑽石價格',
  `image_url` VARCHAR(255) COMMENT '預覽圖片',
  `data` JSON COMMENT '物品數據',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否在售',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
  INDEX `idx_type` (`type`),
  INDEX `idx_price` (`price_coins`, `price_diamonds`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商城物品表';

SET FOREIGN_KEY_CHECKS = 1;

-- ===================================
-- 插入初始數據
-- ===================================

-- 插入測試用戶（密碼: 123456）
INSERT INTO `user` (`username`, `password_hash`, `nickname`, `level`, `exp`, `coins`) VALUES
('test_user', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '測試用戶', 1, 0, 100);

-- 插入基礎語法數據（前10個）
INSERT INTO `grammar` (`pattern`, `meaning_cn`, `explanation`, `category`, `examples`, `difficulty`) VALUES
('だ/です', '是', '表示斷定，です是丁寧語', '基礎句型', '["これは本です", "私は学生だ"]', 1),
('じゃない/ではない', '不是', '表示否定，じゃない是口語形', '基礎句型', '["学生じゃないです", "本ではありません"]', 1),
('か', '疑問句', '疑問助詞，置於句末', '基礎句型', '["これは何ですか", "学生ですか"]', 1),
('の', '的（所屬）', '表示所屬關係', '助詞', '["私の本", "田中さんの車"]', 1),
('も', '也', '表示添加', '助詞', '["私も学生です", "これも本です"]', 1),
('は(wa)', '主題標記', '主題助詞，讀作wa', '助詞', '["私は田中です", "本は重いです"]', 1),
('が', '主語標記', '主語助詞', '助詞', '["猫がいます", "雨が降っています"]', 2),
('を', '賓語標記', '賓語助詞', '助詞', '["ご飯を食べます", "本を読みます"]', 1),
('に', '方向/時間/目的', '多功能助詞', '助詞', '["学校に行きます", "9時に起きます"]', 2),
('で', '場所/手段', '表示動作場所或手段', '助詞', '["バスで行きます", "図書館で勉強します"]', 2);

-- 插入基礎單詞數據（前20個）
INSERT INTO `word` (`japanese`, `hiragana`, `chinese`, `category`) VALUES
('私', 'わたし', '我', 'pronoun'),
('あなた', 'あなた', '你', 'pronoun'),
('これ', 'これ', '這個', 'pronoun'),
('それ', 'それ', '那個', 'pronoun'),
('本', 'ほん', '書', 'object'),
('車', 'くるま', '車子', 'object'),
('猫', 'ねこ', '貓', 'animal'),
('犬', 'いぬ', '狗', 'animal'),
('食べる', 'たべる', '吃', 'verb'),
('飲む', 'のむ', '喝', 'verb'),
('行く', 'いく', '去', 'verb'),
('来る', 'くる', '來', 'verb'),
('大きい', 'おおきい', '大的', 'adjective'),
('小さい', 'ちいさい', '小的', 'adjective'),
('新しい', 'あたらしい', '新的', 'adjective'),
('古い', 'ふるい', '舊的', 'adjective'),
('学校', 'がっこう', '學校', 'place'),
('家', 'いえ', '家', 'place'),
('駅', 'えき', '車站', 'place'),
('病院', 'びょういん', '醫院', 'place');

-- 插入關卡配置（五十音島前3關）
INSERT INTO `stage_config` (`area_id`, `stage_id`, `title`, `description`, `game_type`, `config_data`, `unlock_condition`, `rewards`) VALUES
(1, 1, '假名消消樂 - 入門', '學習あ行基礎假名', 'match', '{"mode": "basic", "hiragana": ["あ","い","う","え","お"], "grid": "4x4", "timeLimit": 120}', '{}', '{"exp": 50, "coins": 10}'),
(1, 2, '假名消消樂 - 進階', '學習か行假名', 'match', '{"mode": "basic", "hiragana": ["か","き","く","け","こ"], "grid": "4x4", "timeLimit": 100}', '{"previous_stage": 1, "min_stars": 1}', '{"exp": 60, "coins": 15}'),
(1, 3, '假名消消樂 - 混合', 'あ行+か行混合練習', 'match', '{"mode": "advanced", "hiragana": ["あ","い","う","え","お","か","き","く","け","こ"], "grid": "6x4", "timeLimit": 90}', '{"previous_stage": 2, "min_stars": 2}', '{"exp": 80, "coins": 20}');

COMMIT;

-- 顯示創建完成信息
SELECT '🎌 Nihongo Quest 數據庫初始化完成!' as message;