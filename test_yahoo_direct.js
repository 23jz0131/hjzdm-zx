const https = require('https');
const querystring = require('querystring');

function testYahooDirectAPI() {
    const appId = 'dj00aiZpPUdGaG5wWk1aRldQTSZzPWNvbnN1bWVyc2VjcmV0Jng9YWM-';
    const keyword = encodeURIComponent('手机');
    
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${appId}&query=${keyword}&start=1&results=10&format=json`;
    
    console.log('🔍 测试Yahoo API直接调用:');
    console.log('URL:', url);
    
    https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('状态码:', res.statusCode);
            console.log('响应头:', res.headers);
            
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ JSON解析成功');
                console.log('响应数据结构:', Object.keys(jsonData));
                
                if (jsonData.Error) {
                    console.log('❌ API错误:', jsonData.Error);
                } else if (jsonData.hits) {
                    console.log('✅ 找到商品数据');
                    console.log('商品数量:', jsonData.hits.length);
                    if (jsonData.hits.length > 0) {
                        const firstItem = jsonData.hits[0].Item;
                        console.log('第一个商品:', {
                            name: firstItem.Name,
                            price: firstItem.Price,
                            url: firstItem.Url
                        });
                    }
                } else {
                    console.log('响应数据:', JSON.stringify(jsonData, null, 2));
                }
            } catch (e) {
                console.log('❌ JSON解析失败:', e.message);
                console.log('原始响应:', data.substring(0, 500));
            }
        });
    }).on('error', (err) => {
        console.log('❌ 请求错误:', err.message);
    });
}

testYahooDirectAPI();