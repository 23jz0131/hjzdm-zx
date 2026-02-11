const axios = require('axios');

async function checkYahooData() {
  try {
    console.log('🔍 检查Yahoo商品数据详细信息...\n');
    
    const response = await axios.get('http://localhost:9090/goods/compare?keyword=Switch');
    
    console.log('📊 响应状态:', response.status);
    console.log('📦 商品总数:', response.data.length);
    console.log('\n📋 商品详情:');
    
    response.data.forEach((item, index) => {
      console.log(`\n--- 商品 ${index + 1} ---`);
      console.log('标题:', item.title);
      console.log('平台:', item.platform);
      console.log('价格:', item.price);
      console.log('链接:', item.link);
      console.log('店铺:', item.store || '无');
    });
    
    // 统计各平台商品数量
    const platformStats = {};
    response.data.forEach(item => {
      const platform = item.platform || '未知';
      platformStats[platform] = (platformStats[platform] || 0) + 1;
    });
    
    console.log('\n📈 平台分布统计:');
    Object.entries(platformStats).forEach(([platform, count]) => {
      console.log(`${platform}: ${count} 件`);
    });
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

checkYahooData();