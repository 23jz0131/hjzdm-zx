const axios = require('axios');

async function testAuthRemoval() {
  console.log('=== 测试认证移除效果 ===\n');
  
  try {
    // 测试1: 直接访问管理API（不带任何认证信息）
    console.log('1. 测试直接访问管理API...');
    const response1 = await axios.get('http://localhost:9090/api/admin/user-management');
    console.log('✅ 成功获取用户列表，状态码:', response1.status);
    console.log('✅ 返回数据长度:', response1.data.data?.length || 0);
    console.log('');
    
    // 测试2: 使用错误的token
    console.log('2. 测试使用错误的token...');
    try {
      const response2 = await axios.get('http://localhost:9090/api/admin/user-management', {
        headers: {
          'Authorization': 'Bearer invalid-token-here'
        }
      });
      console.log('✅ 即使使用错误token也能访问，状态码:', response2.status);
    } catch (error) {
      console.log('❌ 使用错误token时出错:', error.response?.status);
    }
    console.log('');
    
    // 测试3: 访问需要用户信息的接口
    console.log('3. 测试访问用户信息接口...');
    const response3 = await axios.post('http://localhost:9090/api/user/me');
    console.log('✅ 成功访问用户信息接口，状态码:', response3.status);
    console.log('');
    
    console.log('=== 测试完成 ===');
    console.log('🎉 认证已成功移除！所有API都可以在无认证状态下访问。');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:');
    console.error('状态码:', error.response?.status);
    console.error('错误信息:', error.message);
    console.error('响应数据:', error.response?.data);
  }
}

// 执行测试
testAuthRemoval();