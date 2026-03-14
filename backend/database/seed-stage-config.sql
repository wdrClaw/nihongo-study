-- 為區域2-3添加新的關卡配置
-- 包含語法跑酷和聽力射擊遊戲類型

-- 區域2：語法城 (area_id = 2)
INSERT IGNORE INTO stage_config (area_id, stage_id, title, description, game_type, config_data, rewards) VALUES

-- 語法城第1關：語法跑酷入門
(2, 1, '語法跑酷入門', '學習基礎句型，在跑酷中收集詞塊組成句子', 'grammar_runner',
 JSON_OBJECT(
   'difficulty', 1,
   'time_limit_seconds', 180,
   'target_score', 500,
   'mode', 'normal',
   'sentences', JSON_ARRAY(
     JSON_OBJECT(
       'chinese', '我是學生',
       'japanese_words', JSON_ARRAY('私は', '学生', 'です'),
       'distractors', JSON_ARRAY('先生', 'じゃない', 'でした')
     )
   )
 ),
 JSON_OBJECT('exp', 80, 'coins', 50)),

-- 語法城第2關：助詞大作戰
(2, 2, '助詞大作戰', '掌握基礎助詞的使用方法', 'grammar_runner',
 JSON_OBJECT(
   'difficulty', 1,
   'time_limit_seconds', 180,
   'target_score', 600,
   'mode', 'normal',
   'sentences', JSON_ARRAY(
     JSON_OBJECT(
       'chinese', '我去學校',
       'japanese_words', JSON_ARRAY('私は', '学校に', '行きます'),
       'distractors', JSON_ARRAY('学校で', '学校を', '帰ります')
     )
   )
 ),
 JSON_OBJECT('exp', 80, 'coins', 50)),

-- 語法城第3關：動詞變化
(2, 3, '動詞變化練習', '練習動詞的基本變化形式', 'grammar_runner',
 JSON_OBJECT(
   'difficulty', 2,
   'time_limit_seconds', 160,
   'target_score', 700,
   'mode', 'normal',
   'sentences', JSON_ARRAY(
     JSON_OBJECT(
       'chinese', '昨天吃了壽司',
       'japanese_words', JSON_ARRAY('昨日', 'お寿司を', '食べました'),
       'distractors', JSON_ARRAY('食べます', '食べない', '飲みました')
     )
   )
 ),
 JSON_OBJECT('exp', 100, 'coins', 60)),

-- 語法城第4關：聽力射擊初體驗（便利店場景）
(2, 4, '便利店會話', '在便利店場景中練習基本會話聽力', 'listening_shooter',
 JSON_OBJECT(
   'scene', 'convenience_store',
   'difficulty', 1,
   'time_limit_seconds', 300,
   'target_score', 400,
   'balloon_count', 4,
   'time_per_question', 12
 ),
 JSON_OBJECT('exp', 90, 'coins', 55)),

-- 語法城第5關：語法跑酷進階
(2, 5, '複合句型挑戰', '學習更複雜的句型結構', 'grammar_runner',
 JSON_OBJECT(
   'difficulty', 2,
   'time_limit_seconds', 150,
   'target_score', 800,
   'mode', 'advanced',
   'sentences', JSON_ARRAY(
     JSON_OBJECT(
       'chinese', '因為下雨所以不去',
       'japanese_words', JSON_ARRAY('雨が', '降っているので', '行きません'),
       'distractors', JSON_ARRAY('行きます', '降りません', '晴れています')
     )
   )
 ),
 JSON_OBJECT('exp', 120, 'coins', 70)),

-- 語法城第6關：車站聽力射擊
(2, 6, '車站問路', '在車站場景中練習問路對話', 'listening_shooter',
 JSON_OBJECT(
   'scene', 'station',
   'difficulty', 2,
   'time_limit_seconds', 280,
   'target_score', 500,
   'balloon_count', 5,
   'time_per_question', 10
 ),
 JSON_OBJECT('exp', 100, 'coins', 60)),

-- 語法城第7關：語法跑酷大師
(2, 7, '語法大師之路', '挑戰高難度語法組合', 'grammar_runner',
 JSON_OBJECT(
   'difficulty', 3,
   'time_limit_seconds', 120,
   'target_score', 1000,
   'mode', 'expert',
   'sentences', JSON_ARRAY(
     JSON_OBJECT(
       'chinese', '如果明天天氣好的話就去公園',
       'japanese_words', JSON_ARRAY('明日', '天気が', '良ければ', '公園に', '行きます'),
       'distractors', JSON_ARRAY('悪ければ', '行きません', '昨日', '家に')
     )
   )
 ),
 JSON_OBJECT('exp', 150, 'coins', 90)),

-- 語法城BOSS關：語法綜合對決
(2, 8, '語法綜合對決', '語法城最終挑戰，綜合運用所學語法', 'word_battle',
 JSON_OBJECT(
   'boss', 'grammar_master',
   'word_category', JSON_ARRAY('verb', 'adjective'),
   'questions', 10,
   'time_per_question', 8,
   'time_limit_seconds', 360,
   'target_score', 1200
 ),
 JSON_OBJECT('exp', 200, 'coins', 120));

-- 區域3：會話廣場 (area_id = 3)
INSERT IGNORE INTO stage_config (area_id, stage_id, title, description, game_type, config_data, rewards) VALUES

-- 會話廣場第1關：餐廳會話入門
(3, 1, '餐廳點餐基礎', '學習餐廳基本點餐會話', 'listening_shooter',
 JSON_OBJECT(
   'scene', 'restaurant',
   'difficulty', 1,
   'time_limit_seconds', 300,
   'target_score', 400,
   'balloon_count', 4,
   'time_per_question', 12
 ),
 JSON_OBJECT('exp', 90, 'coins', 55)),

-- 會話廣場第2關：語音道場進階
(3, 2, '發音精進訓練', '提升日語發音準確度', 'voice_dojo',
 JSON_OBJECT(
   'practice_type', 'word_pronunciation',
   'time_limit_seconds', 240,
   'target_score', 300,
   'passing_score', 70,
   'word_categories', JSON_ARRAY('food', 'family')
 ),
 JSON_OBJECT('exp', 100, 'coins', 60)),

-- 會話廣場第3關：電話會話挑戰
(3, 3, '電話會話挑戰', '練習電話中的基本對話', 'listening_shooter',
 JSON_OBJECT(
   'scene', 'phone',
   'difficulty', 2,
   'time_limit_seconds', 280,
   'target_score', 500,
   'balloon_count', 5,
   'time_per_question', 10
 ),
 JSON_OBJECT('exp', 110, 'coins', 65)),

-- 會話廣場第4關：情景語法跑酷
(3, 4, '情景對話組裝', '在對話情景中組裝正確的句子', 'grammar_runner',
 JSON_OBJECT(
   'difficulty', 2,
   'time_limit_seconds', 150,
   'target_score', 800,
   'mode', 'dialogue',
   'sentences', JSON_ARRAY(
     JSON_OBJECT(
       'chinese', '您好，請問洗手間在哪裡',
       'japanese_words', JSON_ARRAY('すみません', 'トイレは', 'どこですか'),
       'distractors', JSON_ARRAY('ありがとう', 'いくらですか', 'いりません')
     )
   )
 ),
 JSON_OBJECT('exp', 120, 'coins', 70)),

-- 會話廣場第5關：綜合會話射擊
(3, 5, '綜合會話挑戰', '多場景混合的聽力射擊', 'listening_shooter',
 JSON_OBJECT(
   'scene', 'mixed',
   'difficulty', 3,
   'time_limit_seconds', 250,
   'target_score', 600,
   'balloon_count', 6,
   'time_per_question', 8
 ),
 JSON_OBJECT('exp', 130, 'coins', 80)),

-- 會話廣場第6關：高級語音挑戰
(3, 6, '高級語音挑戰', '挑戰複雜的語音識別任務', 'voice_dojo',
 JSON_OBJECT(
   'practice_type', 'sentence_reading',
   'time_limit_seconds', 300,
   'target_score', 400,
   'passing_score', 80,
   'complexity', 'high'
 ),
 JSON_OBJECT('exp', 140, 'coins', 85)),

-- 會話廣場第7關：會話大師之路
(3, 7, '會話大師之路', '最高難度的多技能綜合挑戰', 'listening_shooter',
 JSON_OBJECT(
   'scene', 'challenge',
   'difficulty', 3,
   'time_limit_seconds', 200,
   'target_score', 800,
   'balloon_count', 6,
   'time_per_question', 6,
   'special_mode', 'expert'
 ),
 JSON_OBJECT('exp', 160, 'coins', 100)),

-- 會話廣場BOSS關：會話綜合對決
(3, 8, '會話大師決戰', '會話廣場最終BOSS，綜合會話能力測試', 'word_battle',
 JSON_OBJECT(
   'boss', 'conversation_master',
   'word_category', JSON_ARRAY('verb', 'adjective', 'family', 'place'),
   'questions', 12,
   'time_per_question', 7,
   'time_limit_seconds', 400,
   'target_score', 1500,
   'special_abilities', JSON_ARRAY('time_pressure', 'audio_distraction')
 ),
 JSON_OBJECT('exp', 250, 'coins', 150));

-- 插入新的BOSS數據（如果不存在）
INSERT IGNORE INTO boss (code, name_cn, name_jp, description_cn, max_hp, special_abilities) VALUES
('grammar_master', '語法大師', '文法の達人', '掌握所有N5語法的強大對手，擅長語法變化攻擊', 8, 
 JSON_OBJECT('grammar_confusion', '語法混亂', 'time_pressure', '時間壓迫')),
('conversation_master', '會話大師', '会話の達人', '精通日常會話的終極對手，能夠模擬各種對話場景', 10,
 JSON_OBJECT('scene_switch', '場景切換', 'audio_distraction', '音頻干擾', 'speed_boost', '語速加快'));