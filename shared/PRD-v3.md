# Nihongo Quest（日語冒險）— 產品需求文檔 v3.0

> **版本**：v3.0 | **日期**：2026-03-21  
> **產品負責人**：wangdery | **文檔作者**：大波龍  
> **狀態**：Review  
> **基於**：v2.0 + 開發過程中的實際調整

---

## 1. 產品概述

### 1.1 願景
為中文母語的零基礎日語學習者打造**遊戲化 Web 學習平台**，通過多種遊戲機制，60天內完成 JLPT N5 知識儲備。

### 1.2 核心設備
- **主要**：iPhone（428×926，移動優先設計）
- **次要**：iPad、Android、PC瀏覽器
- **部署**：PWA（已配置 vite-plugin-pwa）

### 1.3 技術棧
- **前端**：Vue3 + Vite + Tailwind v3 + Lucide Icons
- **後端**：Node.js + Express
- **數據庫**：MySQL（192.168.1.12:50000, db: nihongo_quest）
- **緩存**：Redis localhost:6379
- **端口**：前端 3001 / 後端 3002

---

## 2. 與 PRD v2.0 相比的重大變更

| 項目 | v2.0 計劃 | v3.0 實際 | 原因 |
|------|-----------|-----------|------|
| 核心設備 | iPad 8寸 | iPhone 13 Pro Max | 用戶實際使用手機為主 |
| 五十音遊戲 | 消消樂拖拽(KanaCrush) | 打地鼠(KanaWhack) | 用戶認為拖拽不夠形象化 |
| 詞彙遊戲 | 消消樂拖拽(VocabCrush) | 詞彙雨(VocabRain) | 用戶認為拖拽體驗不好 |
| 商業模式 | 付費+廣告+VIP | **暫不開發** | 用戶明確延後 |
| 字體 | Poppins + Noto Sans JP | 系統原生中文字體 | 面向中國用戶 |
| UI風格 | 路徑式關卡地圖 | 卡片列表 + 背景圖 | 用戶否決路徑式設計 |
| 打地鼠背景 | CSS繪製 | 用戶提供的全屏設計稿 | 專業美術質感 |
| 音效 | 完整音效系統 | 靜音佔位(417byte MP3) | 音效資源待補充 |
| TTS | Web Speech API | Google Translate TTS | 跨平台更可靠 |

---

## 3. 系統架構

### 3.1 數據庫（18+2張表）

**核心表**：
| 表名 | 用途 | 記錄數 |
|------|------|--------|
| user | 用戶帳號 | ~3 |
| kana | 92個假名(清音+濁音+拗音) | 92 |
| word | 基礎詞彙 | 220 |
| grammar | 語法點 | 40 |
| stage_config | 關卡配置 | 36 |
| vocab_item | 擴展詞彙（分類） | ~1000 |
| vocab_category | 詞彙分類 | ~20 |

**用戶進度表**：
| 表名 | 用途 |
|------|------|
| user_stage_progress | 關卡星級/分數 |
| user_vocabulary | 單詞學習記錄(SRS) |
| user_grammar | 語法學習記錄 |
| user_achievement | 成就解鎖 |
| user_daily_task | 每日任務 |
| user_game_stats | 遊戲統計 |
| user_exam_result | 模擬考成績 |

**系統表**：
| 表名 | 用途 |
|------|------|
| achievement | 成就定義(22個) |
| boss | BOSS戰配置 |
| daily_task_template | 每日任務模板 |
| exam_paper | 模擬考試卷 |
| login_reward | 登錄獎勵 |
| shop_item | 商店物品 |

### 3.2 後端 API 路由

| 文件 | 路徑 | 功能 |
|------|------|------|
| auth.js | /api/auth/* | 登錄/註冊/token驗證 |
| user.js | /api/user/* | 用戶信息/等級/進度 |
| stage.js | /api/stage/* | 關卡配置/結果提交 |
| map.js | /api/map/* | 地圖數據/區域解鎖 |
| vocab.js | /api/vocab/* | 詞彙分類/SRS復習 |
| vocabulary.js | /api/vocabulary/* | 詞彙手冊 |
| daily-tasks.js | /api/user/daily-tasks | 每日任務 |

### 3.3 前端路由

| 路由 | 頁面 | 狀態 |
|------|------|------|
| / | Landing Page | ✅ 完成 |
| /auth/login | 登錄 | ✅ 完成 |
| /auth/register | 註冊 | ✅ 完成 |
| /game/map | 世界地圖(6區域) | ✅ 完成 |
| /game/area/:id/stages | 關卡選擇 | ✅ 完成（專業UI） |
| /game/play/:stageId | 遊戲頁面 | ✅ 完成 |
| /game/gojuon | 五十音圖 | ✅ 完成（6Tab+視頻） |
| /game/vocab-book | 詞彙手冊 | ✅ 完成 |
| /game/grammar-book | 語法手冊 | ⬜ 佔位 |
| /game/conversation-book | 會話手冊 | ⬜ 佔位 |

---

## 4. 六大區域 & 關卡體系

### Area 1：五十音島（7關）
**遊戲類型**：打地鼠 (KanaWhack)
**背景**：用戶提供的全屏沙灘場景設計稿

| 關 | 標題 | 模式 | 時間 | 題數 |
|----|------|------|------|------|
| 1 | 平假名入門 | 平假名→羅馬音 | 60s | 15 |
| 2 | 平假名進階 | 平假名→羅馬音 | 60s | 15 |
| 3 | 片假名入門 | 片假名→羅馬音 | 60s | 15 |
| 4 | 片假名進階 | 片假名→羅馬音 | 60s | 15 |
| 5 | 濁音挑戰 | 濁音→羅馬音 | 75s | 20 |
| 6 | 混合亂鬥 | 混合→羅馬音 | 90s | 25 |
| 7 | 終極試煉 | 平假名→片假名 | 90s | 30 |

**配套知識入口**：五十音圖（GojuonChart.vue）— 6Tab分類 + あいうえおのうた 視頻

### Area 2：詞彙島（20關）
**遊戲類型**：詞彙雨 (VocabRain) × 19 + 消消樂 (VocabCrush) × 1

| 關 | 標題 | 詞彙類別 |
|----|------|----------|
| 1 | 数字大挑战 | 數字 |
| 2 | 人称・家族 | 人稱/家族 |
| 3 | 时间・日期 | 時間 |
| 4 | 颜色・方位 | 顏色/方位 |
| 5 | 食物・饮料 | 食物 |
| 6 | 动物王国 | 動物 |
| 7 | 场所・交通 | 場所 |
| 8 | 日常寒暄 | 寒暄 |
| 9 | 身体・衣物 | 身體/衣物 |
| 10 | 综合测验 | 混合 |
| 11-20 | (擴展分類) | 大小形容/家具/洗漱/廚房/自然/學校/運動/購物/感情/基本動詞 |

**詞彙總量**：word表 220 + vocab_item表 ~1000 ≈ **~1200個詞彙**

**配套知識入口**：詞彙手冊（VocabBook.vue）

### Area 3：語法城（8關）
**遊戲類型**：語法跑酷 (GrammarRunner) × 5 + 聽力射擊 (ListeningShooter) × 2 + 詞彙對戰 (WordBattle) × 1

| 關 | 標題 | 類型 |
|----|------|------|
| 1 | 語法跑酷入門 | grammar_runner |
| 2 | 助詞大作戰 | grammar_runner |
| 3 | 動詞變化練習 | grammar_runner |
| 4 | 便利店會話 | listening_shooter |
| 5 | 複合句型挑戰 | grammar_runner |
| 6 | 車站問路 | listening_shooter |
| 7 | 語法大師之路 | grammar_runner |
| 8 | 語法綜合對決 | word_battle |

**語法總量**：40個語法點

**配套知識入口**：語法手冊（待開發）

### Area 4：會話廣場（8關）
**遊戲類型**：聽力射擊 × 4 + 語音道場 (VoiceDojo) × 2 + 語法跑酷 × 1 + 詞彙對戰 × 1

| 關 | 標題 | 類型 |
|----|------|------|
| 1 | 餐廳點餐基礎 | listening_shooter |
| 2 | 發音精進訓練 | voice_dojo |
| 3 | 電話會話挑戰 | listening_shooter |
| 4 | 情景對話組裝 | grammar_runner |
| 5 | 綜合會話挑戰 | listening_shooter |
| 6 | 高級語音挑戰 | voice_dojo |
| 7 | 會話大師之路 | listening_shooter |
| 8 | 會話大師決戰 | word_battle |

**配套知識入口**：會話手冊（待開發）

### Area 5：讀解森林（待規劃）
- DB中無關卡數據
- 規劃中

### Area 6：N5試煉塔（待規劃）
- DB中無關卡數據
- 規劃中

---

## 5. 遊戲組件現狀

| 組件 | 文件 | 狀態 | 使用區域 | 備註 |
|------|------|------|----------|------|
| **KanaWhack** | KanaWhack.vue | ✅ 可玩 | Area 1 | 打地鼠，用戶提供全屏背景圖 |
| **VocabRain** | VocabRain.vue | ✅ 可玩 | Area 2 | 單詞掉落+4選項 |
| **VocabCrush** | VocabCrush.vue | ✅ 可玩 | Area 2(第20關) | 拖拽消消樂 |
| **MatchClear** | MatchClear.vue | ✅ 可玩 | (備用) | 翻牌配對，保留未使用 |
| **KanaCrush** | KanaCrush.vue | ⚠️ 保留 | (備用) | 被KanaWhack替代 |
| **GrammarRunner** | GrammarRunner.vue | ⚠️ 未驗證 | Area 3,4 | 可能有假submit |
| **ListeningShooter** | ListeningShooter.vue | ⚠️ 未驗證 | Area 3,4 | 可能有假submit |
| **WordBattle** | WordBattle.vue | ⚠️ 未驗證 | Area 3,4 | 可能有假submit |
| **VoiceDojo** | VoiceDojo.vue | ⚠️ 部分修復 | Area 4 | Google TTS已接入，發音識別待驗證 |

### ⚠️ 已知問題
1. **GrammarRunner/ListeningShooter/WordBattle** — submitResult 可能是假的（mock），需要逐一驗證
2. **Area 3-4 的關卡** — config_data 是否正確匹配遊戲組件邏輯待驗證
3. **VoiceDojo** — SpeechRecognition 在 iOS Safari 中的兼容性待測試

---

## 6. UI/UX 設計規範

### 6.1 設計原則
- **移動優先**：目標設備 iPhone 13 Pro Max（428×926）
- **遊戲化**：參考 Duolingo/最最日語/LingoDeer 的專業 App 級設計
- **用戶參與設計**：參考圖 = 最終規格，不自由發揮

### 6.2 字體
```css
font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 
             'Microsoft YaHei', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
```
- Google Fonts fallback: Noto Sans SC + Noto Sans JP

### 6.3 StageSelect 頁面設計規範
- **背景**：全屏海島背景圖（用戶提供）
- **進度卡**：左右布局，左=標題+進度條+EXP，右=月桂花環奖章+完成度緞帶
- **卡片**：半透明(rgba 0.45) + backdrop-blur + Lucide矢量圖標
- **配色**：蓝青色系 + 暖金奖章，統一低飽和度
- **不要**：路徑式地圖 / 純白卡片 / emoji代替圖標 / 過重字體

### 6.4 KanaWhack 頁面設計規範
- **背景**：用戶提供的全屏遊戲場景圖（含木牌+洞口+吉祥物+寶箱）
- **顯示方式**：object-fit: fill 拉伸鋪滿
- **石碑**：彩色漸變圓角方塊（黃/藍/綠/橙/紫/粉/靛/青）
- **洞口對齊**：9個絕對定位，百分比坐標精確對齊背景圖
- **HUD**：暗色藥丸條（⭐分數 + ⏱倒計時），"找到 X" 白色提示標籤
- **底部**：❤️生命 + 進度計數

---

## 7. 功能模塊狀態總覽

### ✅ 已完成
| 功能 | 說明 |
|------|------|
| 用戶系統 | 註冊/登錄/JWT認證/等級升級(while loop連跳) |
| 世界地圖 | 6區域卡片，區域1-2默認解鎖，3+需前區3星 |
| 關卡選擇 | 專業UI，背景圖+毛玻璃卡片+進度卡+Lucide圖標 |
| 五十音島 | 7關打地鼠（KanaWhack），全流程可玩 |
| 詞彙島 | 20關詞彙雨/消消樂，全流程可玩 |
| 五十音圖 | 6Tab分類+影片+發音 |
| 詞彙手冊 | 分類瀏覽+搜索 |
| 進度系統 | 星級/分數/經驗值/金幣/升級 |
| PWA | manifest + workbox + apple-mobile-web-app |
| Google TTS | 日語發音（跨平台） |
| API baseURL | 動態 window.location.hostname |
| CORS | origin: true（開發階段） |

### ⬜ 待開發/驗證
| 功能 | 優先級 | 說明 |
|------|--------|------|
| Area 3-4 遊戲驗證 | **P0** | GrammarRunner/ListeningShooter/WordBattle 的 submitResult 可能是假的 |
| Area 5-6 關卡 | P1 | 讀解森林 + N5試煉塔，DB無數據 |
| 語法手冊 | P1 | /game/grammar-book 頁面 |
| 會話手冊 | P1 | /game/conversation-book 頁面 |
| 每日任務 | P2 | 路由被重定向到首頁，需修復 |
| 商店頁面 | P3 | "即將上線" 佔位 |
| 設置頁面 | P3 | "即將上線" 佔位 |
| 成就系統 | P3 | DB有22個成就定義，前端未展示 |
| 模擬考試 | P2 | exam_paper 表有數據，前端未實現 |
| SRS復習 | P2 | API已有，前端入口未做 |
| 音效系統 | P3 | 目前靜音佔位文件 |

### ❌ 明確不做（當前階段）
| 功能 | 原因 |
|------|------|
| 商業模式（付費/廣告/VIP） | 用戶明確延後 |
| Capacitor 原生打包 | PWA 優先 |
| 多語言 | 只支持中文 |

---

## 8. 數據缺口

| 數據 | 現有 | N5要求 | 缺口 |
|------|------|--------|------|
| 假名 | 92 | 92 | ✅ 完成 |
| 詞彙 | ~1200 (word 220 + vocab_item ~1000) | 800 | ✅ 超額完成 |
| 語法 | 40 | 82 | ⚠️ 差42個 |
| Area 5-6 關卡 | 0 | ~15 | ⚠️ 未規劃 |

---

## 9. 下一步行動建議

### Phase 3（建議優先級排序）
1. **驗證 Area 3-4 遊戲組件** — 確保 submitResult 真實調用API，遊戲邏輯正常
2. **補全42個語法點** — grammar 表從40→82
3. **語法手冊頁面** — /game/grammar-book 實現
4. **Area 5-6 關卡設計** — 讀解+模擬考
5. **每日任務路由修復**
6. **模擬考試功能**

### 技術債
- 清理中間文件 gojuon-song.webm
- 統一其他頁面到 StageSelect 設計風格
- git commit + push 所有未提交更改

---

## 10. 測試帳號

| 用戶名 | 密碼 | userId | 說明 |
|--------|------|--------|------|
| wangdery | test1234 | 13 | 主測試帳號，進度已重置 |
| wintest | test1234 | 15 | Windows測試 |
| demo2026 | test1234 | 11 | Demo |

---

## 11. 部署信息

| 環境 | 地址 | 說明 |
|------|------|------|
| 本地前端 | http://192.168.1.69:3001 | Vite dev server (--host) |
| 本地後端 | http://192.168.1.69:3002 | Express |
| GitHub | git@github.com:wdrClaw/nihongo-study.git | main branch |
| MySQL | 192.168.1.12:50000 | db: nihongo_quest |

---

*文檔結束 — v3.0*
