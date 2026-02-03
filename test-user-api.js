const axios = require('axios');

async function testUserAPI() {
  console.log('=== ユーザーAPIテスト ===\n');
  
  try {
    // 测试1: 直接调用用户信息API
    console.log('1. ユーザー情報APIテスト...');
    const response1 = await axios.post('http://localhost:9090/api/user/me');
    console.log('ステータスコード:', response1.status);
    console.log('レスポンスデータ:', JSON.stringify(response1.data, null, 2));
    console.log('');
    
    // 测试2: 测试用户指标API
    console.log('2. ユーザー指標APIテスト...');
    const response2 = await axios.post('http://localhost:9090/api/user/metrics');
    console.log('ステータスコード:', response2.status);
    console.log('レスポンスデータ:', JSON.stringify(response2.data, null, 2));
    console.log('');
    
    console.log('=== テスト完了 ===');
    
  } catch (error) {
    console.error('❌ テストエラー:');
    console.error('ステータスコード:', error.response?.status);
    console.error('エラーメッセージ:', error.message);
    console.error('レスポンスデータ:', error.response?.data);
    console.error('リクエスト情報:', error.config);
  }
}

// 実行
testUserAPI();