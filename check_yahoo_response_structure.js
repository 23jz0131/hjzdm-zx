const https = require('https');

console.log('🔍 检查Yahoo API实际响应结构...\n');

function checkYahooResponseStructure() {
    const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
    const keyword = 'iPhone';
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=1&results=2&format=json`;
    
    console.log('请求URL:', url);
    
    https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`状态码: ${res.statusCode}`);
            
            try {
                const json = JSON.parse(data);
                console.log('\n=== Yahoo API 响应结构分析 ===');
                console.log('顶级键:', Object.keys(json));
                
                if (json.hits && Array.isArray(json.hits) && json.hits.length > 0) {
                    console.log(`\n第一个商品的结构:`);
                    const firstHit = json.hits[0];
                    console.log('hit层级键:', Object.keys(firstHit));
                    
                    if (firstHit.Item) {
                        console.log('Item层级键:', Object.keys(firstHit.Item));
                        console.log('\n关键字段值:');
                        console.log('Name:', firstHit.Item.Name);
                        console.log('Url:', firstHit.Item.Url);
                        console.log('Price:', firstHit.Item.Price);
                        console.log('Image存在:', !!firstHit.Item.Image);
                        if (firstHit.Item.Image) {
                            console.log('Image子键:', Object.keys(firstHit.Item.Image));
                            console.log('Medium:', firstHit.Item.Image.Medium);
                        }
                    }
                    
                    // 检查我们代码中的条件
                    const item = firstHit.Item;
                    console.log('\n=== 我们的过滤条件检查 ===');
                    console.log('item != null:', item != null);
                    console.log('item.Name != null:', item && item.Name != null);
                    console.log('item.Url != null:', item && item.Url != null);
                    console.log('item.Price != null:', item && item.Price != null);
                    console.log('价格可转换为数字:', item && item.Price && !isNaN(Number(item.Price)));
                    
                    if (item && item.Name && item.Price) {
                        console.log('✅ 满足添加条件');
                    } else {
                        console.log('❌ 不满足添加条件');
                    }
                } else {
                    console.log('❌ 无商品数据');
                }
                
            } catch (error) {
                console.log('❌ JSON解析失败:', error.message);
                console.log('原始数据前200字符:', data.substring(0, 200));
            }
        });
    }).on('error', (error) => {
        console.log('❌ HTTP请求失败:', error.message);
    });
}

// 执行检查
checkYahooResponseStructure();