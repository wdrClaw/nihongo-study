import { db } from '../config/database.js';

async function insertStageConfigs() {
  try {
    console.log('🔄 插入關卡配置數據...');

    // Day 1-7 關卡配置（五十音島）
    const stageConfigs = [
      // Day 1: あ行 + い行
      {
        area_id: 1,
        stage_id: 1,
        title: '假名入門',
        description: '學習あいうえお五個基礎假名',
        game_type: 'match_clear',
        config_data: {
          grid_size: "4x4",
          pairs: [
            {hiragana: "あ", romaji: "a"},
            {hiragana: "い", romaji: "i"},
            {hiragana: "う", romaji: "u"},
            {hiragana: "え", romaji: "e"},
            {hiragana: "お", romaji: "o"},
            {hiragana: "か", romaji: "ka"},
            {hiragana: "き", romaji: "ki"},
            {hiragana: "く", romaji: "ku"}
          ],
          mode: "basic",
          time_limit_seconds: 180,
          target_score: 100
        },
        rewards: {exp: 50, coins: 20, items: []}
      },
      
      // Day 2: か行
      {
        area_id: 1,
        stage_id: 2,
        name_cn: '基音之舞',
        description_cn: '掌握か行假名',
        game_type: 'match_clear',
        difficulty: 1,
        time_limit_seconds: 180,
        target_score: 100,
        game_config: JSON.stringify({
          grid_size: "4x4",
          pairs: [
            {hiragana: "か", romaji: "ka"},
            {hiragana: "き", romaji: "ki"},
            {hiragana: "く", romaji: "ku"},
            {hiragana: "け", romaji: "ke"},
            {hiragana: "こ", romaji: "ko"},
            {hiragana: "さ", romaji: "sa"},
            {hiragana: "し", romaji: "shi"},
            {hiragana: "す", romaji: "su"}
          ],
          mode: "basic"
        }),
        rewards: JSON.stringify({exp: 50, coins: 20, items: []})
      },

      // Day 3: さ行 + た行
      {
        area_id: 1,
        stage_id: 3,
        name_cn: '清音挑戰',
        description_cn: '學習さ行和た行',
        game_type: 'match_clear',
        difficulty: 2,
        time_limit_seconds: 150,
        target_score: 120,
        game_config: JSON.stringify({
          grid_size: "5x4",
          pairs: [
            {hiragana: "さ", romaji: "sa"},
            {hiragana: "し", romaji: "shi"},
            {hiragana: "す", romaji: "su"},
            {hiragana: "せ", romaji: "se"},
            {hiragana: "そ", romaji: "so"},
            {hiragana: "た", romaji: "ta"},
            {hiragana: "ち", romaji: "chi"},
            {hiragana: "つ", romaji: "tsu"},
            {hiragana: "て", romaji: "te"},
            {hiragana: "と", romaji: "to"}
          ],
          mode: "basic"
        }),
        rewards: JSON.stringify({exp: 60, coins: 25, items: []})
      },

      // Day 4: 語音道場初體驗
      {
        area_id: 1,
        stage_id: 4,
        name_cn: '初音試煉',
        description_cn: '第一次語音練習',
        game_type: 'voice_dojo',
        difficulty: 1,
        time_limit_seconds: 300,
        target_score: 70,
        game_config: JSON.stringify({
          practice_type: "kana_reading",
          kanas: ["あ", "か", "さ", "た"],
          passing_score: 60
        }),
        rewards: JSON.stringify({exp: 70, coins: 30, items: []})
      },

      // Day 5: な行～わ行 + 片假名配對
      {
        area_id: 1,
        stage_id: 5,
        name_cn: '假名大會戰',
        description_cn: '平假名片假名配對',
        game_type: 'match_clear',
        difficulty: 3,
        time_limit_seconds: 120,
        target_score: 140,
        game_config: JSON.stringify({
          grid_size: "6x4",
          pairs: [
            {hiragana: "な", katakana: "ナ"},
            {hiragana: "は", katakana: "ハ"},
            {hiragana: "ま", katakana: "マ"},
            {hiragana: "や", katakana: "ヤ"},
            {hiragana: "ら", katakana: "ラ"},
            {hiragana: "わ", katakana: "ワ"},
            {hiragana: "に", katakana: "ニ"},
            {hiragana: "ひ", katakana: "ヒ"},
            {hiragana: "み", katakana: "ミ"},
            {hiragana: "り", katakana: "リ"},
            {hiragana: "ぬ", katakana: "ヌ"},
            {hiragana: "ふ", katakana: "フ"}
          ],
          mode: "advanced"
        }),
        rewards: JSON.stringify({exp: 80, coins: 35, items: []})
      },

      // Day 6: 單詞BOSS戰 - 迷路貓
      {
        area_id: 1,
        stage_id: 6,
        name_cn: '迷路貓救援',
        description_cn: '幫助迷路的小貓回家',
        game_type: 'word_battle',
        difficulty: 2,
        time_limit_seconds: 480,
        target_score: 150,
        game_config: JSON.stringify({
          boss: "lost_cat",
          word_category: ["animal", "color"],
          questions: 8,
          time_per_question: 8
        }),
        rewards: JSON.stringify({exp: 100, coins: 50, items: ["cat_badge"]})
      },

      // Day 7: 極限假名消消樂
      {
        area_id: 1,
        stage_id: 7,
        name_cn: '五十音終極試煉',
        description_cn: '混合配對大挑戰',
        game_type: 'match_clear',
        difficulty: 4,
        time_limit_seconds: 90,
        target_score: 180,
        game_config: JSON.stringify({
          grid_size: "8x4",
          pairs: "mixed_all_kana",
          mode: "extreme",
          revival_penalty: true
        }),
        rewards: JSON.stringify({exp: 150, coins: 100, items: ["kana_master_title"]})
      }
    ];

    for (const config of stageConfigs) {
      await db.execute(`
        INSERT IGNORE INTO stage_config 
        (area_id, stage_id, name_cn, description_cn, game_type, difficulty, time_limit_seconds, target_score, game_config, rewards)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        config.area_id, config.stage_id, config.name_cn, config.description_cn,
        config.game_type, config.difficulty, config.time_limit_seconds, config.target_score,
        config.game_config, config.rewards
      ]);
    }

    console.log('✅ 關卡配置插入完成');
    
    // 驗證插入結果
    const [stageCount] = await db.execute('SELECT COUNT(*) as count FROM stage_config');
    console.log(`📊 關卡配置總數: ${stageCount[0].count} 條`);

  } catch (error) {
    console.error('❌ 插入關卡配置失敗:', error);
  } finally {
    process.exit(0);
  }
}

insertStageConfigs();