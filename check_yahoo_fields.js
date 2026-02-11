const https = require('https');

// 测试Yahoo API实际返回的字段结构
function checkYahooFieldNames() {
    const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
    const keyword = 'Switch';
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=1&results=2&format=json`;
    
    console.log('🔍 检查Yahoo API字段名结构...');
    console.log('URL:', url);
    
    https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`状态码: ${res.statusCode}`);
            
            try {
                const json = JSON.parse(data);
                console.log('\n=== Yahoo API 字段名检查 ===');
                
                if (json.hits && json.hits.length > 0) {
                    const firstHit = json.hits[0];
                    console.log('顶层字段:', Object.keys(firstHit));
                    
                    if (firstHit.Item) {
                        console.log('\nItem层级字段:', Object.keys(firstHit.Item));
                        console.log('\n关键字段值:');
                        console.log('Name:', firstHit.Item.Name);
                        console.log('name:', firstHit.Item.name);
                        console.log('Url:', firstHit.Item.Url);
                        console.log('url:', firstHit.Item.url);
                        console.log('Price:', firstHit.Item.Price);
                        console.log('price:', firstHit.Item.price);
                        
                        // 检查Image字段
                        if (firstHit.Item.Image) {
                            console.log('Image字段:', Object.keys(firstHit.Item.Image));
                            console.log('Medium:', firstHit.Item.Image.Medium);
                            console.log('medium:', firstHit.Item.Image.medium);
                        }
                    }
                } else {
                    console.log('无搜索结果');
                }
                
            } catch (error) {
                console.log('JSON解析失败:', error.message);
            }
        });
    }).on('error', (error) => {
        console.log('请求失败:', error.message);
    });
}

checkYahooFieldNames();