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

console.log('Testing Yahoo disable feature...');

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
        
        if (yahooCount === 0) {
          console.log('\n✅ SUCCESS: Yahoo商品搜索已成功关闭！');
        } else {
          console.log('\n❌ FAILED: 仍然返回了Yahoo商品');
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