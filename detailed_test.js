const http = require('http');

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

console.log('Detailed Yahoo search test...');

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
        
        // 统计各平台商品数量
        let platformStats = {};
        let totalItems = 0;
        
        jsonData.data.forEach(group => {
          if (group.goodsList && Array.isArray(group.goodsList)) {
            group.goodsList.forEach(item => {
              const platform = item.mallType;
              platformStats[platform] = (platformStats[platform] || 0) + 1;
              totalItems++;
            });
          }
        });
        
        console.log('\nPlatform statistics:');
        Object.keys(platformStats).forEach(platform => {
          const platformName = platform === '10' ? '乐天(10)' : 
                              platform === '20' ? '雅虎(20)' : 
                              `其他(${platform})`;
          console.log(`${platformName}: ${platformStats[platform]} items`);
        });
        console.log(`Total items: ${totalItems}`);
        
        // 显示一些示例商品
        console.log('\nSample items by platform:');
        const samples = {};
        jsonData.data.slice(0, 5).forEach(group => {
          if (group.goodsList && group.goodsList.length > 0) {
            group.goodsList.slice(0, 2).forEach(item => {
              const platform = item.mallType;
              if (!samples[platform]) samples[platform] = [];
              if (samples[platform].length < 2) {
                samples[platform].push({
                  name: item.goodsName,
                  price: item.goodsPrice,
                  link: item.goodsLink
                });
              }
            });
          }
        });
        
        Object.keys(samples).forEach(platform => {
          const platformName = platform === '10' ? '乐天' : 
                              platform === '20' ? '雅虎' : 
                              `平台${platform}`;
          console.log(`\n${platformName}商品示例:`);
          samples[platform].forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name.substring(0, 50)}...`);
            console.log(`     价格: ¥${item.price}`);
          });
        });
        
      } else {
        console.log('No data found in response');
      }
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  console.log('Make sure the backend server is running on http://localhost:9090');
});

req.write(postData);
req.end();