import fs from 'fs';
import { db } from '../config/database.js';

async function createMissingTables() {
  try {
    console.log('🔄 創建缺失的數據表...');

    const sql = `
      USE nihongo_quest;

      CREATE TABLE IF NOT EXISTS kana (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hiragana CHAR(1) NOT NULL COMMENT '平假名',
        katakana CHAR(1) NOT NULL COMMENT '片假名',  
        romaji VARCHAR(5) NOT NULL COMMENT '羅馬音',
        category ENUM('basic', 'dakuten', 'handakuten', 'youon') DEFAULT 'basic' COMMENT '分類',
        pronunciation_url VARCHAR(255) COMMENT '發音文件URL',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='假名數據表';

      CREATE TABLE IF NOT EXISTS achievement (
        id VARCHAR(50) PRIMARY KEY COMMENT '成就ID',
        name_cn VARCHAR(100) NOT NULL COMMENT '成就名稱',
        description_cn TEXT COMMENT '成就描述',
        icon VARCHAR(100) COMMENT '圖標',
        category VARCHAR(30) COMMENT '分類',
        reward_exp INT DEFAULT 0 COMMENT '獎勵經驗',
        reward_coins INT DEFAULT 0 COMMENT '獎勵金幣',
        reward_item VARCHAR(100) COMMENT '獎勵物品',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就表';

      CREATE TABLE IF NOT EXISTS boss (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(30) UNIQUE NOT NULL COMMENT 'BOSS代碼',
        name_cn VARCHAR(100) NOT NULL COMMENT 'BOSS名稱',
        name_jp VARCHAR(100) COMMENT '日文名稱',
        description_cn TEXT COMMENT 'BOSS描述',
        max_hp INT DEFAULT 5 COMMENT '最大生命值',
        sprite_url VARCHAR(255) COMMENT '精靈圖URL',
        attack_animation VARCHAR(100) COMMENT '攻擊動畫',
        defeat_animation VARCHAR(100) COMMENT '被擊敗動畫',
        special_abilities JSON COMMENT '特殊能力',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='BOSS數據表';
    `;

    const statements = sql.split(';').filter(s => s.trim() && !s.includes('USE '));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`執行: ${statement.trim().substring(0, 50)}...`);
        await db.execute(statement);
      }
    }

    console.log('✅ 缺失表格創建完成');
    
    // 檢查表是否創建成功
    const [tables] = await db.execute("SHOW TABLES LIKE '%'");
    console.log('📋 現有表格:', tables.map(t => Object.values(t)[0]));

  } catch (error) {
    console.error('❌ 創建表格失敗:', error);
  } finally {
    process.exit(0);
  }
}

createMissingTables();