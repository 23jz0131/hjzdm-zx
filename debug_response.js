const axios = require('axios');

async function debugResponse() {
  try {
    console.log('🔍 调试响应数据结构...\n');
    
    const response = await axios.get('http://localhost:9090/goods/compare?keyword=Switch');
    
    console.log('📊 响应状态:', response.status);
    console.log('📄 响应头:', response.headers['content-type']);
    console.log('\n🔧 响应数据类型:', typeof response.data);
    console.log('🔧 响应数据结构:', Array.isArray(response.data) ? '数组' : typeof response.data);
    
    if (typeof response.data === 'object' && response.data !== null) {
      console.log('🔧 对象键名:', Object.keys(response.data));
    }
    
    console.log('\n📋 原始响应数据:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    if (error.response) {
      console.log('🔧 错误响应数据:', error.response.data);
    }
  }
}

debugResponse();