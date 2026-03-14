#!/bin/bash
# Nihongo Quest Backend 重啟腳本

echo "🔄 正在重啟 Nihongo Quest 後端服務..."

# 殺掉現有的後端進程
echo "⏹️  停止現有服務..."
pkill -f "node server.js" || echo "沒有找到運行中的服務"

# 等待進程完全停止
sleep 2

# 切換到後端目錄
cd /Users/miniwdr/ai-factory/projects/nihongo-game/backend

# 檢查端口是否被占用
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口3002仍被占用，強制釋放..."
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 啟動新的後端服務
echo "🚀 啟動新服務..."
nohup node server.js > /tmp/nihongo-backend.log 2>&1 &

# 等待服務啟動
sleep 3

# 檢查服務是否成功啟動
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ 後端服務重啟成功！"
    echo "📊 服務狀態: http://localhost:3002/health"
    echo "📋 日志文件: /tmp/nihongo-backend.log"
else
    echo "❌ 後端服務啟動失敗！"
    echo "📋 檢查日志: tail -f /tmp/nihongo-backend.log"
    exit 1
fi

echo "🎌 Nihongo Quest Backend 已就緒！"