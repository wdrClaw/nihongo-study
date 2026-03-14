import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 加載環境變量
dotenv.config();

// 獲取當前文件目錄
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 數據庫初始化腳本
 * 執行 init.sql 文件來創建所有表和初始數據
 */
async function setupDatabase() {
  console.log('🚀 開始初始化 Nihongo Quest 數據庫...\n');
  
  let connection;
  
  try {
    // 連接到 MySQL 服務器（不指定數據庫）
    const config = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      charset: 'utf8mb4',
      multipleStatements: true // 允許執行多條 SQL
    };
    
    console.log('📡 連接到 MySQL 服務器...');
    console.log(`   主機: ${config.host}:${config.port}`);
    console.log(`   用戶: ${config.user}`);
    
    connection = await mysql.createConnection(config);
    console.log('✅ MySQL 連接成功!\n');
    
    // 創建數據庫（如果不存在）
    console.log('🗄️  創建數據庫...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 數據庫 '${process.env.DB_NAME}' 準備就緒\n`);
    
    // 切換到目標數據庫
    await connection.query(`USE ${process.env.DB_NAME}`);
    
    // 讀取並執行 SQL 文件
    console.log('📄 讀取 init.sql 文件...');
    const sqlFilePath = path.join(__dirname, 'init.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    console.log('✅ SQL 文件讀取成功\n');
    
    console.log('⚙️  執行數據庫初始化腳本...');
    const startTime = Date.now();
    
    // 執行 SQL 腳本
    await connection.query(sqlContent);
    
    const endTime = Date.now();
    console.log(`✅ 數據庫初始化完成! (耗時: ${endTime - startTime}ms)\n`);
    
    // 驗證表創建
    console.log('🔍 驗證數據庫表...');
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('📋 已創建的表:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    console.log(`\n✅ 總共創建了 ${tables.length} 個表\n`);
    
    // 檢查初始數據
    const [users] = await connection.query('SELECT COUNT(*) as count FROM user');
    const [words] = await connection.query('SELECT COUNT(*) as count FROM word');
    const [grammars] = await connection.query('SELECT COUNT(*) as count FROM grammar');
    const [stages] = await connection.query('SELECT COUNT(*) as count FROM stage_config');
    
    console.log('📊 初始數據統計:');
    console.log(`   👤 用戶: ${users[0].count} 個`);
    console.log(`   📝 單詞: ${words[0].count} 個`);
    console.log(`   📚 語法: ${grammars[0].count} 個`);
    console.log(`   🎮 關卡: ${stages[0].count} 個\n`);
    
    console.log('🎉 ===========================================');
    console.log('🎌 Nihongo Quest 數據庫初始化完成!');
    console.log('🚀 現在可以啟動後端服務器了!');
    console.log('💡 運行命令: npm run dev');
    console.log('🎉 ===========================================');
    
  } catch (error) {
    console.error('❌ 數據庫初始化失敗:');
    console.error('   錯誤信息:', error.message);
    console.error('   錯誤代碼:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 可能的解決方案:');
      console.error('   1. 檢查 MySQL 服務是否啟動');
      console.error('   2. 檢查 .env 文件中的數據庫配置');
      console.error('   3. 檢查網絡連接和防火牆設置');
    }
    
    process.exit(1);
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 數據庫連接已關閉');
    }
  }
}

// 如果直接運行此文件，則執行初始化
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabase();
}

export default setupDatabase;