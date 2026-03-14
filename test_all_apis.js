// 測試所有主要API端點
async function testAllAPIs() {
  const baseURL = 'http://localhost:3002';
  
  console.log('🧪 測試 Nihongo Quest 所有API...\n');
  
  // 1. 健康檢查
  console.log('1. 健康檢查');
  try {
    const healthResponse = await fetch(`${baseURL}/health`);
    const health = await healthResponse.json();
    console.log('✅ 健康檢查:', health.success ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ 健康檢查: FAIL -', error.message);
  }
  
  // 2. 用戶登錄
  console.log('\n2. 用戶登錄');
  let token = '';
  try {
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'wangdery', password: 'test1234' })
    });
    const login = await loginResponse.json();
    token = login.token;
    console.log('✅ 用戶登錄:', login.success ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ 用戶登錄: FAIL -', error.message);
    return;
  }
  
  // 3. 獲取每日任務
  console.log('\n3. 每日任務API');
  try {
    const tasksResponse = await fetch(`${baseURL}/api/daily-tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tasks = await tasksResponse.json();
    console.log('✅ 每日任務:', tasks.success ? 'PASS' : 'FAIL');
    console.log(`   📋 任務數量: ${tasks.tasks?.length || 0}`);
  } catch (error) {
    console.log('❌ 每日任務: FAIL -', error.message);
  }
  
  // 4. 獲取關卡配置 (1-1)
  console.log('\n4. 關卡配置API (1-1)');
  try {
    const stageResponse = await fetch(`${baseURL}/api/stage/1/1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const stage = await stageResponse.json();
    console.log('✅ 關卡配置:', stage.success ? 'PASS' : 'FAIL');
    if (stage.success) {
      console.log(`   🎮 遊戲類型: ${stage.stage.game_type}`);
      console.log(`   📝 標題: ${stage.stage.title}`);
      console.log(`   🎯 game_data存在: ${stage.stage.game_data ? 'YES' : 'NO'}`);
      console.log(`   🔢 假名對數量: ${stage.stage.game_data?.pairs?.length || 0}`);
    }
  } catch (error) {
    console.log('❌ 關卡配置: FAIL -', error.message);
  }
  
  // 5. 測試其他關卡
  console.log('\n5. 檢查所有關卡 (1-1 到 1-7)');
  for (let stageId = 1; stageId <= 7; stageId++) {
    try {
      const stageResponse = await fetch(`${baseURL}/api/stage/1/${stageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const stage = await stageResponse.json();
      if (stage.success) {
        console.log(`   ✅ 1-${stageId}: ${stage.stage.title} (${stage.stage.game_type})`);
      } else {
        console.log(`   ❌ 1-${stageId}: ${stage.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 1-${stageId}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 API測試完成！');
}

// 如果在Node.js環境中運行
if (typeof fetch === 'undefined') {
  console.log('請在支持fetch的環境中運行此腳本，或安裝node-fetch');
  console.log('npm install node-fetch');
  process.exit(1);
} else {
  testAllAPIs();
}