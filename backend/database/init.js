/**
 * 數據庫初始化腳本
 * 創建表結構並插入種子數據
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    console.log('🔄 開始初始化數據庫...');

    // 讀取並執行 schema.sql
    console.log('📋 創建數據表...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // 簡單的SQL語句分割（跳過註釋行）
    const schemaStatements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('/*') && !s.match(/^\s*$/));

    for (const statement of schemaStatements) {
      if (statement.trim() && !statement.includes('DELIMITER') && !statement.includes('//')) {
        try {
          console.log(`執行SQL: ${statement.substring(0, 50)}...`);
          await db.execute(statement);
        } catch (error) {
          console.error(`SQL執行失敗: ${error.message}`);
          console.error(`SQL語句: ${statement}`);
          throw error;
        }
      }
    }
    
    console.log('✅ 數據表創建完成');

    // 讀取並執行 seeds.sql
    console.log('🌱 插入種子數據...');
    const seedsSQL = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf8');
    
    // 分割SQL語句
    const seedStatements = seedsSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.match(/^\s*$/));

    for (const statement of seedStatements) {
      if (statement.trim()) {
        try {
          await db.execute(statement);
        } catch (error) {
          // 忽略重複插入錯誤
          if (!error.message.includes('Duplicate entry')) {
            throw error;
          }
        }
      }
    }
    
    console.log('✅ 種子數據插入完成');

    // 驗證數據
    console.log('🔍 驗證數據表...');
    
    // 檢查表是否存在
    const [tables] = await db.execute("SHOW TABLES LIKE '%'");
    console.log('📋 已創建的表:', tables.map(t => Object.values(t)[0]));
    
    // 檢查數據
    try {
      const [kanaCount] = await db.execute('SELECT COUNT(*) as count FROM kana');
      const [wordCount] = await db.execute('SELECT COUNT(*) as count FROM word');
      const [grammarCount] = await db.execute('SELECT COUNT(*) as count FROM grammar');
      const [achievementCount] = await db.execute('SELECT COUNT(*) as count FROM achievement');
      const [stageCount] = await db.execute('SELECT COUNT(*) as count FROM stage_config');
      
      console.log('📊 數據統計:');
      console.log(`   - 假名數據: ${kanaCount[0].count} 條`);
      console.log(`   - 單詞數據: ${wordCount[0].count} 條`);
      console.log(`   - 語法數據: ${grammarCount[0].count} 條`);
      console.log(`   - 成就數據: ${achievementCount[0].count} 條`);
      console.log(`   - 關卡配置: ${stageCount[0].count} 條`);
    } catch (error) {
      console.error('❌ 數據驗證失敗:', error.message);
      return false;
    }

    console.log('🎉 數據庫初始化完成！');
    return true;

  } catch (error) {
    console.error('❌ 數據庫初始化失敗:', error);
    return false;
  }
}

// 如果直接運行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      console.log('✅ 數據庫初始化成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 數據庫初始化失敗:', error);
      process.exit(1);
    });
}

export { initDatabase };