-- Nihongo Quest 種子數據
-- 創建時間：2026-03-14
-- 說明：包含五十音、基礎詞彙、語法、成就等初始數據

USE nihongo_quest;

-- 假名數據（平假名、片假名、羅馬音）
INSERT INTO kana (hiragana, katakana, romaji, category) VALUES
-- 清音 (Basic)
('あ', 'ア', 'a', 'basic'),
('い', 'イ', 'i', 'basic'),
('う', 'ウ', 'u', 'basic'),
('え', 'エ', 'e', 'basic'),
('お', 'オ', 'o', 'basic'),
('か', 'カ', 'ka', 'basic'),
('き', 'キ', 'ki', 'basic'),
('く', 'ク', 'ku', 'basic'),
('け', 'ケ', 'ke', 'basic'),
('こ', 'コ', 'ko', 'basic'),
('さ', 'サ', 'sa', 'basic'),
('し', 'シ', 'shi', 'basic'),
('す', 'ス', 'su', 'basic'),
('せ', 'セ', 'se', 'basic'),
('そ', 'ソ', 'so', 'basic'),
('た', 'タ', 'ta', 'basic'),
('ち', 'チ', 'chi', 'basic'),
('つ', 'ツ', 'tsu', 'basic'),
('て', 'テ', 'te', 'basic'),
('と', 'ト', 'to', 'basic'),
('な', 'ナ', 'na', 'basic'),
('に', 'ニ', 'ni', 'basic'),
('ぬ', 'ヌ', 'nu', 'basic'),
('ね', 'ネ', 'ne', 'basic'),
('の', 'ノ', 'no', 'basic'),
('は', 'ハ', 'ha', 'basic'),
('ひ', 'ヒ', 'hi', 'basic'),
('ふ', 'フ', 'fu', 'basic'),
('へ', 'ヘ', 'he', 'basic'),
('ほ', 'ホ', 'ho', 'basic'),
('ま', 'マ', 'ma', 'basic'),
('み', 'ミ', 'mi', 'basic'),
('む', 'ム', 'mu', 'basic'),
('め', 'メ', 'me', 'basic'),
('も', 'モ', 'mo', 'basic'),
('や', 'ヤ', 'ya', 'basic'),
('ゆ', 'ユ', 'yu', 'basic'),
('よ', 'ヨ', 'yo', 'basic'),
('ら', 'ラ', 'ra', 'basic'),
('り', 'リ', 'ri', 'basic'),
('る', 'ル', 'ru', 'basic'),
('れ', 'レ', 're', 'basic'),
('ろ', 'ロ', 'ro', 'basic'),
('わ', 'ワ', 'wa', 'basic'),
('ゐ', 'ヰ', 'wi', 'basic'),
('ゑ', 'ヱ', 'we', 'basic'),
('を', 'ヲ', 'wo', 'basic'),
('ん', 'ン', 'n', 'basic');

-- 濁音 (Dakuten)
INSERT INTO kana (hiragana, katakana, romaji, category) VALUES
('が', 'ガ', 'ga', 'dakuten'),
('ぎ', 'ギ', 'gi', 'dakuten'),
('ぐ', 'グ', 'gu', 'dakuten'),
('げ', 'ゲ', 'ge', 'dakuten'),
('ご', 'ゴ', 'go', 'dakuten'),
('ざ', 'ザ', 'za', 'dakuten'),
('じ', 'ジ', 'ji', 'dakuten'),
('ず', 'ズ', 'zu', 'dakuten'),
('ぜ', 'ゼ', 'ze', 'dakuten'),
('ぞ', 'ゾ', 'zo', 'dakuten'),
('だ', 'ダ', 'da', 'dakuten'),
('ぢ', 'ヂ', 'di', 'dakuten'),
('づ', 'ヅ', 'du', 'dakuten'),
('で', 'デ', 'de', 'dakuten'),
('ど', 'ド', 'do', 'dakuten'),
('ば', 'バ', 'ba', 'dakuten'),
('び', 'ビ', 'bi', 'dakuten'),
('ぶ', 'ブ', 'bu', 'dakuten'),
('べ', 'ベ', 'be', 'dakuten'),
('ぼ', 'ボ', 'bo', 'dakuten');

-- 半濁音 (Handakuten)
INSERT INTO kana (hiragana, katakana, romaji, category) VALUES
('ぱ', 'パ', 'pa', 'handakuten'),
('ぴ', 'ピ', 'pi', 'handakuten'),
('ぷ', 'プ', 'pu', 'handakuten'),
('ぺ', 'ペ', 'pe', 'handakuten'),
('ぽ', 'ポ', 'po', 'handakuten');

-- 基礎單詞（Day 1-7 對應五十音島）
INSERT INTO word (japanese, hiragana, chinese, category, difficulty) VALUES
-- 動物類
('ねこ', 'ねこ', '貓', 'animal', 1),
('いぬ', 'いぬ', '狗', 'animal', 1),
('さる', 'さる', '猴子', 'animal', 2),
('うま', 'うま', '馬', 'animal', 1),
('ぞう', 'ぞう', '大象', 'animal', 2),
('とら', 'とら', '老虎', 'animal', 2),
('うし', 'うし', '牛', 'animal', 1),
('ぶた', 'ぶた', '豬', 'animal', 1),
-- 食物類
('さかな', 'さかな', '魚', 'food', 1),
('にく', 'にく', '肉', 'food', 1),
('やさい', 'やさい', '蔬菜', 'food', 2),
('くだもの', 'くだもの', '水果', 'food', 3),
('りんご', 'りんご', '蘋果', 'food', 2),
('みかん', 'みかん', '橘子', 'food', 2),
('バナナ', 'ばなな', '香蕉', 'food', 1),
('いちご', 'いちご', '草莓', 'food', 2),
('すいか', 'すいか', '西瓜', 'food', 2),
('ぶどう', 'ぶどう', '葡萄', 'food', 2),
-- 数字
('ひとつ', 'ひとつ', '一个', 'number', 1),
('ふたつ', 'ふたつ', '两个', 'number', 2),
('みっつ', 'みっつ', '三个', 'number', 2),
('よっつ', 'よっつ', '四个', 'number', 2),
('いつつ', 'いつつ', '五个', 'number', 2),
-- 家族
('おかあさん', 'おかあさん', '媽媽', 'family', 2),
('おとうさん', 'おとうさん', '爸爸', 'family', 2),
('おにいさん', 'おにいさん', '哥哥', 'family', 3),
('おねえさん', 'おねえさん', '姐姐', 'family', 3),
('おじいさん', 'おじいさん', '爺爺', 'family', 3),
('おばあさん', 'おばあさん', '奶奶', 'family', 3),
-- 顏色
('あか', 'あか', '紅色', 'color', 1),
('あお', 'あお', '藍色', 'color', 1),
('きいろ', 'きいろ', '黃色', 'color', 1),
('しろ', 'しろ', '白色', 'color', 1),
('くろ', 'くろ', '黑色', 'color', 1);

-- 基礎語法（前20個最重要的）
INSERT INTO grammar (pattern, meaning_cn, explanation, category, difficulty, examples) VALUES
('だ / です', '是', '表示断定，です是敬语形式', 'basic', 1, '["これは本です。", "私は学生だ。"]'),
('じゃない / ではない', '不是', '否定形式，ではない更正式', 'basic', 1, '["学生じゃないです。", "猫ではありません。"]'),
('か', '疑问句', '句末添加か表示疑问', 'basic', 1, '["これは何ですか？", "日本人ですか？"]'),
('の', '的（所属）', '表示所属关系', 'basic', 1, '["私の本", "田中さんのかばん"]'),
('も', '也', '表示同样、也', 'basic', 1, '["私も学生です。", "これも本です。"]'),
('は (wa)', '主题标记', '标记句子主题', 'basic', 1, '["私は田中です。", "今日は暑いです。"]'),
('が', '主语标记', '标记主语', 'basic', 2, '["猫がいます。", "誰が来ますか？"]'),
('を', '宾语标记', '标记动作的对象', 'basic', 2, '["ご飯を食べます。", "本を読みます。"]'),
('に', '方向/时间/目的', '表示方向、时间点、目的等', 'basic', 2, '["学校に行きます。", "3時に起きます。"]'),
('で', '场所/手段', '表示动作发生的场所或手段', 'basic', 2, '["図書館で勉強します。", "バスで行きます。"]'),
('と', '和/引用', '表示并列或引用', 'basic', 2, '["友達と行きます。", "「はい」と言います。"]'),
('へ (e)', '方向', '表示移动的方向', 'basic', 2, '["日本へ行きます。", "家へ帰ります。"]'),
('これ / それ / あれ', '这个/那个/那个（远）', '指示代词', 'demonstrative', 1, '["これは何ですか？", "それは本です。", "あれは車です。"]'),
('ここ / そこ / あそこ', '这里/那里/那里（远）', '场所指示词', 'demonstrative', 1, '["ここは図書館です。", "そこに本があります。"]'),
('どこ / どれ / どの', '哪里/哪个/哪~', '疑问词', 'interrogative', 2, '["トイレはどこですか？", "どれが好きですか？"]'),
('ます / ません', '敬语动词肯定/否定', '动词敬语形式', 'verb', 2, '["食べます。", "食べません。"]'),
('ました / ませんでした', '过去肯定/过去否定', '动词过去时敬语形式', 'verb', 2, '["食べました。", "食べませんでした。"]'),
('たい / たくない', '想做/不想做', '表示意愿', 'verb', 2, '["食べたいです。", "行きたくないです。"]'),
('てください', '请做~', '敬语命令形', 'verb', 2, '["見てください。", "来てください。"]'),
('がある / がいる', '有~（物/人）', '存在表达', 'existence', 2, '["本があります。", "猫がいます。"]');

-- BOSS數據
INSERT INTO boss (code, name_cn, name_jp, description_cn, max_hp, special_abilities) VALUES
('lost_cat', '迷路貓', 'まよいねこ', '一隻迷路的小貓，需要通過動物和自然相關的單詞來幫助它找到回家的路', 5, '{"rotate_options": false}'),
('sushi_master', '壽司大將', 'すしたいしょう', '技藝高超的壽司師傅，精通各種食物名稱，選項會旋轉增加難度', 6, '{"rotate_options": true, "rotation_speed": 2}'),
('kanji_demon', '漢字鬼', 'かんじおに', '古老的漢字精靈，專門考驗漢字讀音，所有選項都用漢字顯示', 7, '{"kanji_only": true}'),
('time_lord', '時間魔王', 'じかんまおう', '掌控時間的魔王，擅長數字、時間、日期，限時會縮短到5秒', 8, '{"time_limit": 5}'),
('particle_ninja', '助詞忍者', 'じょしにんじゃ', '隱身的語法忍者，專門考驗助詞填空，身形會隱現', 7, '{"particle_focus": true, "invisibility": true}'),
('conjugation_wave', '活用波', 'かつようなみ', '變化無常的語法波動，考驗動詞變形，會產生波動干擾', 8, '{"verb_conjugation": true, "wave_effect": true}');

-- 成就數據
INSERT INTO achievement (id, name_cn, description_cn, icon, category, reward_exp, reward_coins, reward_item) VALUES
('persistence_fire', '堅持之火', '連續學習7天', '🔥', 'daily', 100, 100, null),
('lightning_learner', '閃電學霸', '單日完成5個關卡', '⚡', 'stage', 50, 50, null),
('perfect_shooter', '完美射手', 'BOSS戰零失誤通關', '🎯', 'boss', 200, 200, null),
('pronunciation_master', '發音大師', '語音道場連續3次滿分', '🗣️', 'voice', 150, 150, null),
('hundred_words', '百詞斬', '累計學會100個單詞', '📚', 'vocabulary', 100, 100, null),
('n5_qualified', 'N5合格', '模擬考80分以上', '🏆', 'exam', 500, 500, 'n5_certificate'),
('three_star_master', '全三星', '某區域所有關卡三星', '🌟', 'stage', 300, 300, null),
('dragon_slayer', '屠龍勇者', '擊敗最終BOSS', '🐉', 'boss', 1000, 1000, 'dragon_slayer_title'),
('graduate', '畢業生', '完成60天全部課程', '🎓', 'completion', 0, 0, 'graduation_frame'),
('first_step', '第一步', '完成第一個關卡', '👣', 'stage', 20, 10, null),
('voice_brave', '語音勇者', '完成第一次語音練習', '🎤', 'voice', 30, 20, null),
('combo_king', 'Combo King', '單詞戰鬥連擊超過10次', '💥', 'boss', 80, 80, null),
('early_bird', '早起鳥兒', '連續5天早上8點前學習', '🐦', 'daily', 60, 60, null),
('night_owl', '夜貓子', '連續3天晚上10點後學習', '🦉', 'daily', 60, 60, null),
('speed_demon', '速度惡魔', '30秒內完成假名消消樂', '👹', 'game', 100, 100, null);

-- 每日任務模板
INSERT INTO daily_task_template (id, name_cn, description_cn, target_count, reward_exp, reward_coins, icon) VALUES
('learn_words', '學習新單詞', '學習3個新單詞', 3, 20, 10, '📝'),
('complete_stage', '完成關卡', '完成1個關卡', 1, 30, 15, '🎯'),
('voice_practice', '語音練習', '語音練習5分鐘', 5, 20, 10, '🎤'),
('review_words', '復習單詞', '復習昨天的錯題', 1, 30, 15, '📖');

-- 連續登入獎勵
INSERT INTO login_reward (day_count, reward_exp, reward_coins, reward_item, special_reward) VALUES
(1, 30, 0, null, null),
(2, 50, 0, null, null),
(3, 80, 30, null, null),
(5, 100, 50, null, null),
(7, 200, 200, 'random_outfit', null),
(14, 300, 300, null, 'two_week_hero_title'),
(30, 500, 500, 'limited_skin', null),
(60, 1000, 1000, 'graduation_certificate', null);

-- Day 1-7 關卡配置（五十音島）
INSERT INTO stage_config (area_id, stage_id, name_cn, description_cn, game_type, difficulty, time_limit_seconds, target_score, game_config, rewards) VALUES
-- Day 1: あ行 + い行
(1, 1, '假名入門', '學習あいうえお五個基礎假名', 'match_clear', 1, 180, 100, 
 '{"grid_size": "4x4", "pairs": [{"hiragana": "あ", "romaji": "a"}, {"hiragana": "い", "romaji": "i"}, {"hiragana": "う", "romaji": "u"}, {"hiragana": "え", "romaji": "e"}, {"hiragana": "お", "romaji": "o"}], "mode": "basic"}',
 '{"exp": 50, "coins": 20, "items": []}'),

-- Day 2: か行
(1, 2, '的音之舞', '掌握か行假名', 'match_clear', 1, 180, 100,
 '{"grid_size": "4x4", "pairs": [{"hiragana": "か", "romaji": "ka"}, {"hiragana": "き", "romaji": "ki"}, {"hiragana": "く", "romaji": "ku"}, {"hiragana": "け", "romaji": "ke"}, {"hiragana": "こ", "romaji": "ko"}], "mode": "basic"}',
 '{"exp": 50, "coins": 20, "items": []}'),

-- Day 3: さ行 + た行
(1, 3, '清音挑戰', '學習さ行和た行', 'match_clear', 2, 150, 120,
 '{"grid_size": "5x4", "pairs": [{"hiragana": "さ", "romaji": "sa"}, {"hiragana": "し", "romaji": "shi"}, {"hiragana": "す", "romaji": "su"}, {"hiragana": "せ", "romaji": "se"}, {"hiragana": "そ", "romaji": "so"}, {"hiragana": "た", "romaji": "ta"}, {"hiragana": "ち", "romaji": "chi"}, {"hiragana": "つ", "romaji": "tsu"}, {"hiragana": "て", "romaji": "te"}, {"hiragana": "と", "romaji": "to"}], "mode": "basic"}',
 '{"exp": 60, "coins": 25, "items": []}'),

-- Day 4: 語音道場初體驗
(1, 4, '初音試煉', '第一次語音練習', 'voice_dojo', 1, 300, 70,
 '{"practice_type": "kana_reading", "kanas": ["あ", "か", "さ", "た"], "passing_score": 60}',
 '{"exp": 70, "coins": 30, "items": []}'),

-- Day 5: な行～わ行 + 片假名配對
(1, 5, '假名大會戰', '平假名片假名配對', 'match_clear', 3, 120, 140,
 '{"grid_size": "6x4", "pairs": [{"hiragana": "な", "katakana": "ナ"}, {"hiragana": "は", "katakana": "ハ"}, {"hiragana": "ま", "katakana": "マ"}, {"hiragana": "や", "katakana": "ヤ"}, {"hiragana": "ら", "katakana": "ラ"}, {"hiragana": "わ", "katakana": "ワ"}], "mode": "advanced"}',
 '{"exp": 80, "coins": 35, "items": []}'),

-- Day 6: 單詞BOSS戰 - 迷路貓
(1, 6, '迷路貓救援', '幫助迷路的小貓回家', 'word_battle', 2, 480, 150,
 '{"boss": "lost_cat", "word_category": ["animal", "nature"], "questions": 8, "time_per_question": 8}',
 '{"exp": 100, "coins": 50, "items": ["cat_badge"]}'),

-- Day 7: 極限假名消消樂
(1, 7, '五十音終極試煉', '混合配對大挑戰', 'match_clear', 4, 90, 180,
 '{"grid_size": "8x4", "pairs": "mixed_all_kana", "mode": "extreme", "revival_penalty": true}',
 '{"exp": 150, "coins": 100, "items": ["kana_master_title"]}');

-- 創建測試用戶（開發用）
INSERT INTO user (username, password_hash, nickname, level, exp, coins) VALUES
('testuser', '$2a$10$K7L/WvNVc6ZTu9o9z8j6JeHOIGkgjHTM9LZlFZZs9tFmVz1B5oZay', '測試用戶', 5, 450, 500);

-- 為測試用戶添加一些進度
INSERT INTO user_stage_progress (user_id, area_id, stage_id, stars, best_score, attempts, completed_at) VALUES
((SELECT id FROM user WHERE username = 'testuser'), 1, 1, 3, 180, 1, NOW()),
((SELECT id FROM user WHERE username = 'testuser'), 1, 2, 2, 140, 2, NOW()),
((SELECT id FROM user WHERE username = 'testuser'), 1, 3, 1, 120, 3, NOW());