# Nihongo Quest（日語冒險）

🎌 60天通關 JLPT N5 的遊戲化日語學習平台

## 項目概述

Nihongo Quest 是一個創新的日語學習遊戲，通過6種核心遊戲機制幫助學習者在60天內掌握 JLPT N5 所需的全部知識。

### 核心特點

- 🎮 **6種遊戲模式**：假名消消樂、BOSS戰、語音道場、語法跑酷、聽力射擊、模擬考試
- 🗺️ **6大冒險區域**：五十音島→單詞村→語法城→會話廣場→讀解森林→N5試煉塔
- 📚 **完整學習體系**：800個單詞、82個語法點、92個假名
- 🎯 **遊戲化激勵**：等級系統、成就徽章、每日任務、連續登入獎勵

## 技術棧

### 前端
- **框架**：Vue 3 + Vite
- **UI**：Tailwind CSS
- **狀態管理**：Pinia
- **路由**：Vue Router
- **遊戲引擎**：PixiJS
- **音頻**：Howler.js
- **動畫**：Lottie Web

### 後端
- **運行時**：Node.js
- **框架**：Express
- **數據庫**：MySQL 8.0
- **緩存**：Redis
- **認證**：JWT

## 快速開始

### 環境要求

- Node.js 22+
- MySQL 8.0
- Redis

### 安裝步驟

1. **克隆倉庫**
```bash
git clone <repo-url>
cd nihongo-game
```

2. **安裝前端依賴**
```bash
cd frontend
npm install
```

3. **安裝後端依賴**
```bash
cd ../backend
npm install
```

4. **配置環境變量**
```bash
# 複製環境變量模板
cp .env.example .env

# 編輯 .env 文件，填入你的數據庫配置
```

5. **初始化數據庫**
```bash
npm run setup
```

6. **啟動開發服務器**

後端（端口 3002）：
```bash
cd backend
npm run dev
```

前端（端口 3001）：
```bash
cd frontend
npm run dev
```

### 訪問應用

- 前端：http://localhost:3001
- 後端 API：http://localhost:3002
- 健康檢查：http://localhost:3002/health

## 項目結構

```
nihongo-game/
├── frontend/                 # Vue3 前端
│   ├── src/
│   │   ├── views/            # 頁面組件
│   │   ├── components/       # 公用組件
│   │   ├── stores/           # Pinia 狀態管理
│   │   └── router/           # 路由配置
├── backend/                  # Node.js 後端
│   ├── src/
│   │   ├── routes/           # API 路由
│   │   ├── controllers/      # 控制器
│   │   ├── models/           # 數據模型
│   │   └── middleware/       # 中間件
│   ├── config/               # 配置文件
│   └── database/             # 數據庫相關
└── shared/                   # 共享文檔
    └── PRD.md               # 產品需求文檔
```

## 開發進度

### ✅ Phase 0: 項目搭建
- [x] 前後端工程初始化
- [x] 數據庫設計與建表
- [x] 基礎 API 架構
- [x] 認證系統（JWT）

### ✅ Phase 1: MVP 基礎功能
- [x] 用戶註冊/登入
- [x] 世界地圖頁面
- [x] 關卡選擇頁面
- [x] 基礎成長系統（等級、經驗、金幣）
- [x] 每日任務框架
- [x] 用戶資料管理

### 🚧 Phase 2: 核心遊戲（進行中）
- [ ] 假名消消樂遊戲
- [ ] BOSS 戰鬥系統
- [ ] 語音道場
- [ ] 語法跑酷
- [ ] 聽力射擊

### 📋 Phase 3: 內容填充（計劃中）
- [ ] 800個單詞數據 + 音頻
- [ ] 82個語法點數據
- [ ] 3套模擬試題
- [ ] Day 1-60 全部關卡配置

### 🎨 Phase 4: 打磨上線（計劃中）
- [ ] 動畫效果優化
- [ ] 音效完善
- [ ] PWA 離線支持
- [ ] 性能優化

## API 文檔

### 認證相關
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/verify` - Token 驗證

### 用戶相關
- `GET /api/user/profile` - 獲取用戶資料
- `PUT /api/user/profile` - 更新用戶資料
- `GET /api/user/progress` - 獲取學習進度

### 地圖相關
- `GET /api/map/progress` - 獲取地圖進度
- `GET /api/map/area/:areaId/stats` - 獲取區域統計

## 數據庫設計

核心表結構：
- `user` - 用戶基本信息
- `user_stage_progress` - 關卡進度
- `user_vocabulary` - 單詞學習記錄
- `user_grammar` - 語法學習記錄
- `word` - 單詞題庫
- `grammar` - 語法題庫
- `stage_config` - 關卡配置

## 貢獻指南

1. Fork 本倉庫
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 創建 Pull Request

## 許可證

本項目採用 MIT 許可證 - 詳見 [LICENSE](LICENSE) 文件

## 聯繫方式

項目負責人：wangdery