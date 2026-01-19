const http = require('http');

const postData = JSON.stringify({
  query: 'iphone'
});

const options = {
  hostname: 'localhost',
  port: 9090,
  path: '/goods/search',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('Testing Rakuten API integration...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Headers:', res.headers);
    try {
      const jsonData = JSON.parse(data);
      console.log('Response Body:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.data && Array.isArray(jsonData.data)) {
        console.log(`\nFound ${jsonData.data.length} items`);
        if (jsonData.data.length > 0) {
          console.log('First few items:');
          jsonData.data.slice(0, 3).forEach((item, index) => {
            console.log(`${index + 1}. ${item.goodsName} - ¥${item.goodsPrice} - Mall: ${item.mallType}`);
          });
        }
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