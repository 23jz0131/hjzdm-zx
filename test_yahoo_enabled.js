const http = require('http');
const axios = require('axios');

async function testYahooSearch() {
    console.log('=== 测试Yahoo搜索功能 ===\n');
    
    const baseUrl = 'http://localhost:9090';
    
    try {
        // 1. 测试基本连接
        console.log('1. 测试后端连接...');
        const healthCheck = await axios.get(`${baseUrl}/goods/queryGoods`, {
            params: { query: 'test' },
            timeout: 5000
        });
        console.log('✅ 后端服务连接正常\n');
        
        // 2. 测试Yahoo搜索功能
        console.log('2. 测试Yahoo搜索功能...');
        const searchQuery = 'ノートパソコン';
        console.log(`搜索关键词: ${searchQuery}`);
        
        const startTime = Date.now();
        const response = await axios.get(`${baseUrl}/goods/queryGoods`, {
            params: { 
                query: searchQuery,
                pageNum: 1,
                pageSize: 10
            },
            timeout: 15000
        });
        const endTime = Date.now();
        
        console.log(`\n响应时间: ${endTime - startTime}ms`);
        console.log(`HTTP状态码: ${response.status}`);
        
        if (response.data && response.data.length > 0) {
            console.log(`\n✅ 找到 ${response.data.length} 个商品`);
            console.log('\n前3个商品信息:');
            response.data.slice(0, 3).forEach((item, index) => {
                console.log(`${index + 1}. ${item.goodsName}`);
                console.log(`   价格: ¥${item.goodsPrice}`);
                console.log(`   商城类型: ${item.mallType === 20 ? 'Yahoo购物' : '其他'}`);
                console.log(`   链接: ${item.goodsLink ? item.goodsLink.substring(0, 50) + '...' : '无'}`);
                console.log('');
            });
            
            // 检查是否有Yahoo来源的商品
            const yahooItems = response.data.filter(item => item.mallType === 20);
            console.log(`Yahoo商品数量: ${yahooItems.length}/${response.data.length}`);
            
            if (yahooItems.length > 0) {
                console.log('🎉 Yahoo搜索功能已成功启用！');
            } else {
                console.log('⚠️  没有找到Yahoo来源的商品，可能是搜索结果中没有匹配项');
            }
        } else {
            console.log('❌ 未找到任何商品');
            console.log('响应数据:', JSON.stringify(response.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ 测试失败:');
        if (error.response) {
            console.error(`HTTP错误: ${error.response.status}`);
            console.error('响应数据:', error.response.data);
        } else if (error.request) {
            console.error('网络错误: 无法连接到后端服务');
        } else {
            console.error('其他错误:', error.message);
        }
    }
}

// 运行测试
testYahooSearch();

const postData = JSON.stringify({
  query: 'iphone'
});

const options = {
  hostname: 'localhost',
  port: 9090,
  path: '/goods/compare',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing Yahoo re-enable feature...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response received successfully');
      
      if (jsonData.data && Array.isArray(jsonData.data)) {
        console.log(`Total groups found: ${jsonData.data.length}`);
        
        // Count items by platform
        let rakutenCount = 0;
        let yahooCount = 0;
        let otherCount = 0;
        
        jsonData.data.forEach(group => {
          if (group.goodsList && Array.isArray(group.goodsList)) {
            group.goodsList.forEach(item => {
              if (item.mallType === 10) {
                rakutenCount++;
              } else if (item.mallType === 20) {
                yahooCount++;
              } else {
                otherCount++;
              }
            });
          }
        });
        
        console.log('\nPlatform breakdown:');
        console.log(`Rakuten (10): ${rakutenCount} items`);
        console.log(`Yahoo (20): ${yahooCount} items`);
        console.log(`Other: ${otherCount} items`);
        
        if (yahooCount > 0) {
          console.log('\n✅ SUCCESS: Yahoo商品搜索已成功重新启用！');
          console.log(`   共找到 ${yahooCount} 个雅虎商品`);
        } else {
          console.log('\n❌ FAILED: 仍未返回雅虎商品');
        }
        
        // Show some sample items
        if (jsonData.data.length > 0) {
          console.log('\nSample items:');
          const sampleGroup = jsonData.data[0];
          console.log(`商品名称: ${sampleGroup.goodsName}`);
          console.log(`最低价格: ¥${sampleGroup.lowestPrice}`);
          console.log(`最低价格平台: ${sampleGroup.lowestPlatform}`);
          
          if (sampleGroup.goodsList && sampleGroup.goodsList.length > 0) {
            console.log('各平台价格:');
            sampleGroup.goodsList.slice(0, 3).forEach((item, index) => {
              const platform = item.mallType === 10 ? '乐天' : item.mallType === 20 ? '雅虎' : '其他';
              console.log(`  ${index + 1}. ${platform}: ¥${item.goodsPrice}`);
            });
          }
        }
      } else {
        console.log('No data found in response');
      }
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  console.log('Make sure the backend server is running on http://localhost:9090');
});

req.write(postData);
req.end();