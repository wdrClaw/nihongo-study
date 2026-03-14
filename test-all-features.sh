#!/bin/bash
# Nihongo Quest 全功能測試腳本

echo "🎌 Nihongo Quest 全功能測試"
echo "================================="

# 1. 測試後端健康檢查
echo "🔍 測試後端健康狀態..."
HEALTH=$(curl -s http://localhost:3002/health)
if [[ $HEALTH == *"success\":true"* ]]; then
    echo "✅ 後端服務正常"
else
    echo "❌ 後端服務異常"
    exit 1
fi

# 2. 測試前端是否運行
echo "🔍 測試前端服務..."
FRONTEND=$(curl -s http://localhost:3001/ | head -n 1)
if [[ $FRONTEND == *"DOCTYPE html"* ]]; then
    echo "✅ 前端服務正常"
else
    echo "❌ 前端服務異常"
fi

# 3. 測試用戶登入
echo "🔍 測試用戶登入API..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "wangdery", "password": "test1234"}')

if [[ $LOGIN_RESPONSE == *"success\":true"* ]]; then
    echo "✅ 登入API正常"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ 登入API異常"
    exit 1
fi

# 4. 測試關卡配置API
echo "🔍 測試關卡配置API..."
STAGE_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3002/api/stage/1/1)
if [[ $STAGE_RESPONSE == *"success\":true"* ]]; then
    echo "✅ 關卡配置API正常"
else
    echo "❌ 關卡配置API異常"
fi

# 5. 測試地圖進度API
echo "🔍 測試地圖進度API..."
MAP_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3002/api/map/progress)
if [[ $MAP_RESPONSE == *"success\":true"* ]]; then
    echo "✅ 地圖進度API正常"
else
    echo "❌ 地圖進度API異常"
fi

# 6. 測試每日任務API
echo "🔍 測試每日任務API..."
TASKS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3002/api/daily-tasks)
if [[ $TASKS_RESPONSE == *"success\":true"* ]]; then
    echo "✅ 每日任務API正常"
else
    echo "❌ 每日任務API異常"
fi

# 7. 測試關卡提交API
echo "🔍 測試關卡提交API..."
SUBMIT_RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"score": 120, "time_spent": 45, "stars": 2, "answers": {"flip_count": 20, "mode": "basic"}}' \
    http://localhost:3002/api/stage/1/1/complete)

if [[ $SUBMIT_RESPONSE == *"success\":true"* ]]; then
    echo "✅ 關卡提交API正常"
else
    echo "❌ 關卡提交API異常"
fi

echo ""
echo "🎉 測試完成！"
echo "================================="
echo "🌐 前端地址: http://localhost:3001"
echo "🔧 後端地址: http://localhost:3002"
echo "📊 健康檢查: http://localhost:3002/health"
echo "📋 後端日志: tail -f /tmp/nihongo-backend.log"
echo ""
echo "💡 登入測試賬號: wangdery / test1234"
echo "🎮 開始遊戲體驗吧！"