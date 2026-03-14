-- 補充成就數據
-- 在現有15個基礎上，再添加一些新成就

-- 語法跑酷相關成就
INSERT IGNORE INTO achievement (id, name_cn, description_cn, icon, category, reward_exp, reward_coins, reward_item) VALUES
('grammar_runner', '語法跑者', '完成第一次語法跑酷', '🏃‍♂️', 'game', 50, 30, null),
('perfect_sentence', '完美句型', '語法跑酷零失誤完成', '💯', 'game', 120, 80, null),
('sentence_master', '句型大師', '語法跑酷累計完成50個句子', '📝', 'game', 200, 150, null);

-- 聽力射擊相關成就
INSERT IGNORE INTO achievement (id, name_cn, description_cn, icon, category, reward_exp, reward_coins, reward_item) VALUES
('listening_sniper', '聽力狙擊手', '完成第一次聽力射擊', '🎯', 'game', 50, 30, null),
('bullet_time_master', '子彈時間大師', '聽力射擊中觸發子彈時間10次', '⚡', 'game', 150, 100, null),
('balloon_buster', '氣球終結者', '聽力射擊累計射爆100個氣球', '🎈', 'game', 180, 120, null);

-- 學習相關成就
INSERT IGNORE INTO achievement (id, name_cn, description_cn, icon, category, reward_exp, reward_coins, reward_item) VALUES
('vocabulary_collector', '詞彙收集家', '學會200個單詞', '📖', 'vocabulary', 200, 150, null),
('grammar_scholar', '語法學者', '掌握30個語法點', '🎓', 'grammar', 180, 120, null),
('study_marathon', '學習馬拉松', '連續學習30天', '🏃', 'daily', 300, 250, 'marathon_badge');

-- 特殊成就
INSERT IGNORE INTO achievement (id, name_cn, description_cn, icon, category, reward_exp, reward_coins, reward_item) VALUES
('perfectionist', '完美主義者', '連續10次關卡獲得三星', '⭐', 'stage', 250, 200, null),
('comeback_king', '逆襲王者', '從零星重新挑戰獲得三星', '👑', 'stage', 100, 80, null),
('area_conqueror', '區域征服者', '完成任意區域所有關卡', '🗺️', 'stage', 200, 150, null),
('mistake_learner', '錯誤中學習', '在錯誤中學會50個單詞', '📚', 'vocabulary', 120, 100, null),
('social_learner', '社交學習者', '與朋友分享學習成果3次', '👥', 'social', 80, 60, null);

-- 節日限定成就（可以根據需要開啟）
INSERT IGNORE INTO achievement (id, name_cn, description_cn, icon, category, reward_exp, reward_coins, reward_item) VALUES
('new_year_learner', '新年學習者', '在新年期間堅持學習', '🎊', 'special', 150, 100, 'new_year_badge'),
('cherry_blossom', '櫻花時節', '在春天完成100個關卡', '🌸', 'special', 200, 150, 'sakura_frame');

-- 統計查詢
-- SELECT category, COUNT(*) as count FROM achievement GROUP BY category ORDER BY count DESC;