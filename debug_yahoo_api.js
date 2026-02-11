const https = require('https');

// Yahoo API配置
const clientId = 'dj00aiZpPUdGaG5wWk1aRldQTSZzPWNvbnN1bWVyc2VjcmV0Jng9YWM-';
const keyword = 'iphone';
const encodedKeyword = encodeURIComponent(keyword);
const start = 1; // 第一页

const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=${start}&results=10&format=json`;

console.log('Testing Yahoo API directly...');
console.log('URL:', url);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Headers:', res.headers);
        
        try {
            const json = JSON.parse(data);
            console.log('\n=== Yahoo API Response ===');
            console.log('Full response keys:', Object.keys(json));
            
            if (json.hits) {
                console.log(`Hits count: ${json.hits.length}`);
                console.log('First hit structure:', Object.keys(json.hits[0] || {}));
                
                if (json.hits.length > 0) {
                    const firstHit = json.hits[0];
                    if (firstHit.Item) {
                        console.log('First item keys:', Object.keys(firstHit.Item));
                        console.log('Item Name:', firstHit.Item.Name);
                        console.log('Item Price:', firstHit.Item.Price);
                        console.log('Item URL:', firstHit.Item.Url);
                        console.log('Item Image:', firstHit.Item.Image ? firstHit.Item.Image.Medium : 'No image');
                    }
                }
            } else {
                console.log('No hits found');
                console.log('Response structure:', JSON.stringify(Object.keys(json), null, 2));
                console.log('Full response:', JSON.stringify(json, null, 2));
            }
            
            if (json.Error) {
                console.log('API Error:', json.Error);
            }
            
            if (json.totalResultsAvailable !== undefined) {
                console.log('Total results available:', json.totalResultsAvailable);
            }
            
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw response:', data.substring(0, 500));
        }
    });

}).on('error', (err) => {
    console.error('Request error:', err.message);
});