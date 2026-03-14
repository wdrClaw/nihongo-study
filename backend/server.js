import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 數據庫配置
import { testDatabaseConnection, closeDatabaseConnections } from './config/database.js';

// 路由導入
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import mapRoutes from './src/routes/map.js';
import stageRoutes from './src/routes/stage.js';
import vocabularyRoutes from './src/routes/vocabulary.js';
import dailyTasksRoutes from './src/routes/daily-tasks.js';
import testRoutes from './src/routes/test.js';

// 加載環境變量
dotenv.config();

// 獲取當前文件目錄
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 創建 Express 應用
const app = express();
const PORT = process.env.PORT || 3002;

// 中間件配置
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 靜態文件服務
app.use('/public', express.static(path.join(__dirname, 'public')));

// API 路由前綴
app.use('/api', (req, res, next) => {
  // 添加 API 響應頭
  res.header('X-API-Version', '1.0');
  next();
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Nihongo Quest Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/stage', stageRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/daily-tasks', dailyTasksRoutes);
app.use('/api/test', testRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '🎌 Nihongo Quest API Server',
    documentation: '/api/docs',
    health: '/health',
    version: '1.0.0'
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : error.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// 啟動服務器
async function startServer() {
  try {
    // 測試數據庫連接
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('❌ 數據庫連接失敗，無法啟動服務器');
      process.exit(1);
    }

    // 啟動 HTTP 服務器
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 ===========================================');
      console.log(`🎌 Nihongo Quest Backend Server Started!`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
      console.log('🚀 ===========================================');
    });

    // 優雅關閉處理
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 收到 ${signal} 信號，正在優雅關閉服務器...`);
      
      server.close(async () => {
        console.log('🔌 HTTP 服務器已關閉');
        await closeDatabaseConnections();
        console.log('👋 服務器已完全關閉');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ 服務器啟動失敗:', error);
    process.exit(1);
  }
}

// 啟動服務器
startServer();