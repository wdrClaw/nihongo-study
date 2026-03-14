import { db } from '../config/database.js';

async function fixStageConfig() {
  try {
    console.log('🔧 修復stage_config表數據...');

    // 清空表並重新插入正確數據
    console.log('🗑️  清空stage_config表...');
    await db.execute('DELETE FROM stage_config');
    
    console.log('📝 插入正確的關卡配置...');
    
    // 區域1：五十音島 - 7個關卡
    const area1Stages = [
      {
        area_id: 1,
        stage_id: 1,
        title: '假名消消樂 - 入門',
        description: '學習基礎五十音：あいうえお、かきくけこ',
        game_type: 'match_clear',
        config_data: {
          grid_size: "4x4",
          pairs: [
            {hiragana: "あ", katakana: "ア", romaji: "a"},
            {hiragana: "い", katakana: "イ", romaji: "i"},
            {hiragana: "う", katakana: "ウ", romaji: "u"},
            {hiragana: "え", katakana: "エ", romaji: "e"},
            {hiragana: "お", katakana: "オ", romaji: "o"},
            {hiragana: "か", katakana: "カ", romaji: "ka"},
            {hiragana: "き", katakana: "キ", romaji: "ki"},
            {hiragana: "く", katakana: "ク", romaji: "ku"}
          ],
          mode: "basic",
          time_limit_seconds: 180,
          target_score: 100
        },
        rewards: {exp: 50, coins: 20, items: []}
      },
      {
        area_id: 1,
        stage_id: 2,
        title: '假名消消樂 - 進階',
        description: '學習：さしすせそ、たちつてと、なにぬねの',
        game_type: 'match_clear',
        config_data: {
          grid_size: "5x4",
          pairs: [
            {hiragana: "さ", katakana: "サ", romaji: "sa"},
            {hiragana: "し", katakana: "シ", romaji: "shi"},
            {hiragana: "す", katakana: "ス", romaji: "su"},
            {hiragana: "せ", katakana: "セ", romaji: "se"},
            {hiragana: "そ", katakana: "ソ", romaji: "so"},
            {hiragana: "た", katakana: "タ", romaji: "ta"},
            {hiragana: "ち", katakana: "チ", romaji: "chi"},
            {hiragana: "つ", katakana: "ツ", romaji: "tsu"},
            {hiragana: "て", katakana: "テ", romaji: "te"},
            {hiragana: "と", katakana: "ト", romaji: "to"}
          ],
          mode: "advanced",
          time_limit_seconds: 150,
          target_score: 120
        },
        rewards: {exp: 80, coins: 30, items: []}
      },
      {
        area_id: 1,
        stage_id: 3,
        title: '假名消消樂 - 挑戰',
        description: '學習：はひふへほ、まみむめも、やゆよ',
        game_type: 'match_clear',
        config_data: {
          grid_size: "6x4",
          pairs: [
            {hiragana: "は", katakana: "ハ", romaji: "ha"},
            {hiragana: "ひ", katakana: "ヒ", romaji: "hi"},
            {hiragana: "ふ", katakana: "フ", romaji: "fu"},
            {hiragana: "へ", katakana: "ヘ", romaji: "he"},
            {hiragana: "ほ", katakana: "ホ", romaji: "ho"},
            {hiragana: "ま", katakana: "マ", romaji: "ma"},
            {hiragana: "み", katakana: "ミ", romaji: "mi"},
            {hiragana: "む", katakana: "ム", romaji: "mu"},
            {hiragana: "め", katakana: "メ", romaji: "me"},
            {hiragana: "も", katakana: "モ", romaji: "mo"},
            {hiragana: "や", katakana: "ヤ", romaji: "ya"},
            {hiragana: "ゆ", katakana: "ユ", romaji: "yu"}
          ],
          mode: "advanced",
          time_limit_seconds: 120,
          target_score: 150
        },
        rewards: {exp: 100, coins: 40, items: []}
      },
      {
        area_id: 1,
        stage_id: 4,
        title: '假名消消樂 - 極限',
        description: '混合模式：平假名、片假名、羅馬音隨機配對',
        game_type: 'match_clear',
        config_data: {
          grid_size: "8x4",
          pairs: "mixed_all_kana", // 特殊標識，後端隨機生成
          mode: "extreme",
          time_limit_seconds: 90,
          target_score: 200
        },
        rewards: {exp: 150, coins: 60, items: []}
      },
      {
        area_id: 1,
        stage_id: 5,
        title: '語音道場 - 發音入門',
        description: '跟讀基礎假名，練習正確發音',
        game_type: 'voice_dojo',
        config_data: {
          practice_type: "kana_reading",
          kanas: ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ"],
          passing_score: 60,
          time_limit_seconds: 300
        },
        rewards: {exp: 120, coins: 50, items: []}
      },
      {
        area_id: 1,
        stage_id: 6,
        title: 'BOSS戰 - 迷路貓',
        description: '對戰迷路貓，測試假名記憶',
        game_type: 'word_battle',
        config_data: {
          boss: "lost_cat",
          word_category: ["animals", "nature"],
          questions: 8,
          time_per_question: 8
        },
        rewards: {exp: 200, coins: 100, items: []}
      },
      {
        area_id: 1,
        stage_id: 7,
        title: '終極試煉 - 假名大師',
        description: '五十音島的最終考驗，證明你的假名功力',
        game_type: 'match_clear',
        config_data: {
          grid_size: "8x4",
          pairs: "mixed_all_kana",
          mode: "extreme",
          time_limit_seconds: 60,
          target_score: 300
        },
        rewards: {exp: 300, coins: 200, items: ["假名大師徽章"]}
      }
    ];

    // 插入關卡配置
    for (const stage of area1Stages) {
      await db.execute(`
        INSERT INTO stage_config (area_id, stage_id, title, description, game_type, config_data, rewards)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        stage.area_id,
        stage.stage_id,
        stage.title,
        stage.description,
        stage.game_type,
        JSON.stringify(stage.config_data),
        JSON.stringify(stage.rewards)
      ]);
      
      console.log(`✅ 插入關卡 ${stage.area_id}-${stage.stage_id}: ${stage.title}`);
    }

    console.log('\n🎉 關卡配置修復完成！');

    // 驗證修復結果
    const [allStages] = await db.execute('SELECT area_id, stage_id, title FROM stage_config ORDER BY area_id, stage_id');
    console.log('\n📋 當前關卡列表:');
    allStages.forEach(stage => {
      console.log(`  ${stage.area_id}-${stage.stage_id}: ${stage.title}`);
    });

  } catch (error) {
    console.error('❌ 修復關卡配置失敗:', error);
  } finally {
    process.exit(0);
  }
}

fixStageConfig();