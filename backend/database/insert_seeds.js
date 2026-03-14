import { db } from '../config/database.js';

async function insertSeeds() {
  try {
    console.log('🌱 開始插入種子數據...');

    // 插入假名數據
    console.log('插入假名數據...');
    const kanaData = [
      // 清音
      ['あ', 'ア', 'a', 'basic'], ['い', 'イ', 'i', 'basic'], ['う', 'ウ', 'u', 'basic'], ['え', 'エ', 'e', 'basic'], ['お', 'オ', 'o', 'basic'],
      ['か', 'カ', 'ka', 'basic'], ['き', 'キ', 'ki', 'basic'], ['く', 'ク', 'ku', 'basic'], ['け', 'ケ', 'ke', 'basic'], ['こ', 'コ', 'ko', 'basic'],
      ['さ', 'サ', 'sa', 'basic'], ['し', 'シ', 'shi', 'basic'], ['す', 'ス', 'su', 'basic'], ['せ', 'セ', 'se', 'basic'], ['そ', 'ソ', 'so', 'basic'],
      ['た', 'タ', 'ta', 'basic'], ['ち', 'チ', 'chi', 'basic'], ['つ', 'ツ', 'tsu', 'basic'], ['て', 'テ', 'te', 'basic'], ['と', 'ト', 'to', 'basic'],
      ['な', 'ナ', 'na', 'basic'], ['に', 'ニ', 'ni', 'basic'], ['ぬ', 'ヌ', 'nu', 'basic'], ['ね', 'ネ', 'ne', 'basic'], ['の', 'ノ', 'no', 'basic'],
      ['は', 'ハ', 'ha', 'basic'], ['ひ', 'ヒ', 'hi', 'basic'], ['ふ', 'フ', 'fu', 'basic'], ['へ', 'ヘ', 'he', 'basic'], ['ほ', 'ホ', 'ho', 'basic'],
      ['ま', 'マ', 'ma', 'basic'], ['み', 'ミ', 'mi', 'basic'], ['む', 'ム', 'mu', 'basic'], ['め', 'メ', 'me', 'basic'], ['も', 'モ', 'mo', 'basic'],
      ['や', 'ヤ', 'ya', 'basic'], ['ゆ', 'ユ', 'yu', 'basic'], ['よ', 'ヨ', 'yo', 'basic'],
      ['ら', 'ラ', 'ra', 'basic'], ['り', 'リ', 'ri', 'basic'], ['る', 'ル', 'ru', 'basic'], ['れ', 'レ', 're', 'basic'], ['ろ', 'ロ', 'ro', 'basic'],
      ['わ', 'ワ', 'wa', 'basic'], ['を', 'ヲ', 'wo', 'basic'], ['ん', 'ン', 'n', 'basic']
    ];

    for (const [hiragana, katakana, romaji, category] of kanaData) {
      await db.execute(
        'INSERT IGNORE INTO kana (hiragana, katakana, romaji, category) VALUES (?, ?, ?, ?)',
        [hiragana, katakana, romaji, category]
      );
    }

    // 插入成就數據
    console.log('插入成就數據...');
    const achievementData = [
      ['persistence_fire', '堅持之火', '連續學習7天', '🔥', 'daily', 100, 100, null],
      ['lightning_learner', '閃電學霸', '單日完成5個關卡', '⚡', 'stage', 50, 50, null],
      ['perfect_shooter', '完美射手', 'BOSS戰零失誤通關', '🎯', 'boss', 200, 200, null],
      ['pronunciation_master', '發音大師', '語音道場連續3次滿分', '🗣️', 'voice', 150, 150, null],
      ['hundred_words', '百詞斬', '累計學會100個單詞', '📚', 'vocabulary', 100, 100, null],
      ['first_step', '第一步', '完成第一個關卡', '👣', 'stage', 20, 10, null]
    ];

    for (const [id, name_cn, description_cn, icon, category, reward_exp, reward_coins, reward_item] of achievementData) {
      await db.execute(
        'INSERT IGNORE INTO achievement (id, name_cn, description_cn, icon, category, reward_exp, reward_coins, reward_item) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name_cn, description_cn, icon, category, reward_exp, reward_coins, reward_item]
      );
    }

    // 插入BOSS數據
    console.log('插入BOSS數據...');
    await db.execute(`
      INSERT IGNORE INTO boss (code, name_cn, name_jp, description_cn, max_hp, special_abilities) VALUES 
      ('lost_cat', '迷路貓', 'まよいねこ', '一隻迷路的小貓，需要通過動物和自然相關的單詞來幫助它找到回家的路', 5, '{"rotate_options": false}'),
      ('sushi_master', '壽司大將', 'すしたいしょう', '技藝高超的壽司師傅，精通各種食物名稱，選項會旋轉增加難度', 6, '{"rotate_options": true}')
    `);

    // 插入每日任務模板
    console.log('插入每日任務模板...');
    await db.execute(`
      INSERT IGNORE INTO daily_task_template (id, name_cn, description_cn, target_count, reward_exp, reward_coins, icon) VALUES 
      ('learn_words', '學習新單詞', '學習3個新單詞', 3, 20, 10, '📝'),
      ('complete_stage', '完成關卡', '完成1個關卡', 1, 30, 15, '🎯'),
      ('voice_practice', '語音練習', '語音練習5分鐘', 5, 20, 10, '🎤'),
      ('review_words', '復習單詞', '復習昨天的錯題', 1, 30, 15, '📖')
    `);

    // 驗證插入結果
    const [kanaCount] = await db.execute('SELECT COUNT(*) as count FROM kana');
    const [achievementCount] = await db.execute('SELECT COUNT(*) as count FROM achievement');
    const [bossCount] = await db.execute('SELECT COUNT(*) as count FROM boss');

    console.log('✅ 種子數據插入完成:');
    console.log(`   - 假名數據: ${kanaCount[0].count} 條`);
    console.log(`   - 成就數據: ${achievementCount[0].count} 條`);
    console.log(`   - BOSS數據: ${bossCount[0].count} 條`);

  } catch (error) {
    console.error('❌ 插入種子數據失敗:', error);
  } finally {
    process.exit(0);
  }
}

insertSeeds();