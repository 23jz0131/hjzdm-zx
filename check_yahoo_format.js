const https = require('https');

console.log('🔍 检查Yahoo API实际响应格式...\n');

function checkYahooFormat() {
    const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
    const keyword = 'iPhone';
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=1&results=3&format=json`;
    
    console.log('请求URL:', url);
    
    https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`状态码: ${res.statusCode}`);
            console.log(`响应头 Content-Type: ${res.headers['content-type']}`);
            
            try {
                const json = JSON.parse(data);
                console.log('\n=== Yahoo API 响应结构分析 ===');
                console.log('顶级键:', Object.keys(json));
                
                if (json.Error) {
                    console.log('\n❌ API返回错误:');
                    console.log('错误代码:', json.Error.Code);
                    console.log('错误消息:', json.Error.Message);
                    return;
                }
                
                if (json.hits && Array.isArray(json.hits)) {
                    console.log(`\n✅ 找到hits数组，包含 ${json.hits.length} 个项目`);
                    
                    if (json.hits.length > 0) {
                        console.log('\n第一个hit的结构:');
                        const firstHit = json.hits[0];
                        console.log('hit层级键:', Object.keys(firstHit));
                        
                        if (firstHit.Item) {
                            console.log('\nItem层级键:', Object.keys(firstHit.Item));
                            console.log('\n关键字段示例:');
                            console.log('Name:', firstHit.Item.Name || 'N/A');
                            console.log('Price:', firstHit.Item.Price || 'N/A');
                            console.log('Url:', firstHit.Item.Url || 'N/A');
                            console.log('Image:', firstHit.Item.Image || 'N/A');
                        } else {
                            console.log('\n⚠️  没有找到Item字段');
                            console.log('hit内容预览:', JSON.stringify(firstHit, null, 2).substring(0, 300));
                        }
                    }
                } else {
                    console.log('\n⚠️  未找到hits数组');
                    console.log('完整响应预览:', JSON.stringify(json, null, 2).substring(0, 500));
                }
                
            } catch (e) {
                console.error('❌ JSON解析失败:', e.message);
                console.log('原始响应前500字符:', data.substring(0, 500));
            }
        });
    }).on('error', (err) => {
        console.error('❌ 请求失败:', err.message);
    });
}

// 执行检查
checkYahooFormat();