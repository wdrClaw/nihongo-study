import mysql from 'mysql2/promise';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// MySQL 數據庫連接池配置
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 創建 MySQL 連接池
export const db = mysql.createPool(dbConfig);

// Redis 客戶端配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

// 創建 Redis 客戶端
export const redis = new Redis(redisConfig);

// 測試數據庫連接
export async function testDatabaseConnection() {
  try {
    // 測試 MySQL 連接
    const connection = await db.getConnection();
    console.log('✅ MySQL 數據庫連接成功');
    
    // 檢查數據庫是否存在，不存在則創建
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 數據庫 ${process.env.DB_NAME} 準備就緒`);
    
    connection.release();
    
    // 測試 Redis 連接
    await redis.ping();
    console.log('✅ Redis 連接成功');
    
    return true;
  } catch (error) {
    console.error('❌ 數據庫連接失敗:', error.message);
    return false;
  }
}

// 優雅關閉數據庫連接
export async function closeDatabaseConnections() {
  try {
    await db.end();
    redis.disconnect();
    console.log('✅ 數據庫連接已關閉');
  } catch (error) {
    console.error('❌ 關閉數據庫連接時出錯:', error);
  }
}