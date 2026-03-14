import { db } from '../config/database.js';

async function checkStageConfig() {
  try {
    console.log('🔍 檢查stage_config表數據...');

    // 獲取所有關卡配置
    const [stages] = await db.execute('SELECT * FROM stage_config ORDER BY area_id, stage_id');
    console.log('📋 所有關卡配置:');
    stages.forEach(stage => {
      console.log(`  ID${stage.id}: 區域${stage.area_id}-關卡${stage.stage_id}`);
      console.log(`    標題: ${stage.title}`);
      console.log(`    遊戲類型: ${stage.game_type}`);
      console.log(`    配置: ${stage.config_data}`);
      console.log(`    獎勵: ${stage.rewards}`);
      console.log('---');
    });

    // 清空表並重新插入正確數據
    console.log('\n🗑️  清空stage_config表...');
    await db.execute('DELETE FROM stage_config');
    
    console.log('📝 插入正確的關卡配置...');
    // 插入正確的關卡配置
    const correctStages = [
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
      }
    ];

    for (const stage of correctStages) {
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
    }

    console.log('✅ 關卡配置更新完成');

    // 驗證更新結果
    const [newStages] = await db.execute('SELECT * FROM stage_config WHERE area_id = 1 AND stage_id = 1');
    console.log('\n✅ 更新後的數據:');
    console.log(newStages[0]);

  } catch (error) {
    console.error('❌ 檢查關卡配置失敗:', error);
  } finally {
    process.exit(0);
  }
}

checkStageConfig();