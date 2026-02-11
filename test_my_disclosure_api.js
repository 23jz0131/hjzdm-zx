const axios = require('axios');

async function testMyDisclosureAPI() {
  console.log('测试用户投稿历史API...');
  
  try {
    // 测试GET请求到/disclosure/my端点
    const response = await axios.get('http://localhost:8080/disclosure/my?pageNum=1&pageSize=10', {
      timeout: 5000
    });
    
    console.log('✅ API调用成功!');
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 后端服务未启动，请先启动Spring Boot应用');
    } else if (error.response) {
      console.log('❌ API返回错误:');
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    } else {
      console.log('❌ 请求失败:', error.message);
    }
  }
}

// 运行测试
testMyDisclosureAPI();