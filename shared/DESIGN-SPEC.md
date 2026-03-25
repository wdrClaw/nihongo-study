# Nihongo Quest — 设计规范

> 更新: 2026-03-25 | 状态: Phase 2 出图进行中

## 设备
- 主设备: iPhone 13 Pro Max (428×926)
- 设计稿尺寸: 1024×1536 (约2.4x)
- 比例: 2:3 竖屏

## 配色方案
- 主色: #FF6B9D (粉红)
- 渐变CTA: #FF6B9D → #FF8A65 (粉到珊瑚)
- 天空渐变: #FFB5A7 → #A8DADC → #B5A0D8 (粉橙→蓝→紫)
- 卡片背景: rgba(255,255,255,0.85) + backdrop-blur
- 文字: #333 正文 / #FFF 白色标题（在深色背景上）

## 字体
```css
font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 
             'Microsoft YaHei', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
```
- 标题: 24px/900
- 副标题: 16px/600
- 正文: 14px/400
- 按钮: 18px/700

## 已生成素材

### 1. 整体设计稿 (参考方向)
- 文件: `designs/landing-v1.png`
- 尺寸: 1024×1536
- 用途: 仅供参考，不直接使用

### 2. 龙虾武士吉祥物
- 文件: `designs/mascot-lobster-samurai.png`
- 尺寸: 1024×1536 (需裁切)
- 用途: App各处吉祥物，需切出主体+去背景
- 代码使用: `<img src="/images/mascot.png" />` 叠加在背景上

### 3. 首页背景图
- 文件: `designs/bg-landing.png`
- 尺寸: 1024×1536
- 用途: Landing 页全屏背景
- 代码使用: `background-image: url('/images/bg-landing.png'); background-size: cover;`
- 特点: 纯背景无文字无UI，樱花+鸟居+富士山+石路

## 待生成素材

### 4. 世界地图背景
- 用途: /game/map 页面背景
- 需求: 俯瞰视角海洋+6个岛屿位置，无文字

### 5. 六个岛屿图标
- 五十音岛: 日式建筑/神社
- 词汇岛: 书本/辞典
- 语法城: 城堡
- 会话广场: 人物对话
- 读解森林: 森林/竹林
- N5试炼塔: 高塔

### 6. 游戏UI组件
- 按钮组件: CTA(渐变粉) / 次要(白底) / 危险(红)
- 卡片组件: 毛玻璃白卡片 + 圆角18px + 阴影
- 进度条: 渐变蓝绿
- 星星: 金色(获得) / 灰色(未获得)
- 生命心: 红色❤️

## 页面清单

| 页面 | 背景素材 | UI组件 | 状态 |
|------|---------|--------|------|
| Landing 首页 | bg-landing.png | 吉祥物+标题+卡片+CTA | 出图中 |
| 登录/注册 | bg-landing.png (复用) | 表单+按钮 | 待设计 |
| 世界地图 | 待生成 | 6岛屿卡片 | 待设计 |
| 关卡选择 | bg-island.png (已有) | ✅ 已完成 | — |
| KanaWhack | bg-full.png (已有) | ✅ 已完成 | — |
| VocabRain | 待确认 | 待验证 | 待设计 |
| 五十音图 | 待设计 | Tab+表格 | 待设计 |
| 词汇手册 | 待设计 | 列表+搜索 | 待设计 |
| 个人中心 | 待设计 | 头像+统计+成就 | 待设计 |
