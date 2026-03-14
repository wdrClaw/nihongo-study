import { db } from '../config/database.js';

async function checkTables() {
  try {
    console.log('🔍 檢查數據庫表結構...');

    // 檢查stage_config表結構
    console.log('\n📋 stage_config表結構:');
    const [stageConfigFields] = await db.execute('DESCRIBE stage_config');
    stageConfigFields.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type} ${field.Null} ${field.Key} ${field.Default || ''}`);
    });

    // 檢查所有表
    console.log('\n📊 數據庫中的所有表:');
    const [tables] = await db.execute("SHOW TABLES LIKE '%'");
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

  } catch (error) {
    console.error('❌ 檢查表結構失敗:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();