const axios = require('axios');

async function testCompareEndpoint() {
  try {
    console.log('🔍 测试正确的POST请求方式...\n');
    
    // 使用POST方法调用compare接口
    const response = await axios.post('http://localhost:9090/goods/compare', {
      query: 'Switch'
    });
    
    console.log('📊 响应状态:', response.status);
    console.log('📦 返回码:', response.data.code);
    console.log('📝 消息:', response.data.msg);
    
    if (response.data.data && Array.isArray(response.data.data)) {
      console.log('📋 商品组数量:', response.data.data.length);
      
      response.data.data.forEach((group, index) => {
        console.log(`\n--- 商品组 ${index + 1} ---`);
        console.log('商品名称:', group.goodsName);
        console.log('最低价格:', group.lowestPrice);
        console.log('最低平台:', group.lowestPlatform);
        console.log('商品数量:', group.goodsList ? group.goodsList.length : 0);
        
        if (group.goodsList && Array.isArray(group.goodsList)) {
          // 统计平台分布
          const platformStats = {};
          group.goodsList.forEach(item => {
            const platform = item.mallType || '未知';
            platformStats[platform] = (platformStats[platform] || 0) + 1;
          });
          
          console.log('平台分布:', platformStats);
        }
      });
    } else {
      console.log('⚠️  未返回有效的商品数据');
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    if (error.response) {
      console.log('🔧 错误响应:', error.response.data);
    }
  }
}

testCompareEndpoint();