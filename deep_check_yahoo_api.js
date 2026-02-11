const https = require('https');

console.log('🔍 深入检查Yahoo API响应内容...\n');

function deepCheckYahooAPI() {
    const keywords = ['iPhone', 'Switch', 'カメラ'];
    
    keywords.forEach((keyword, index) => {
        setTimeout(() => {
            console.log(`\n=== 测试关键词: "${keyword}" ===`);
            
            const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
            const encodedKeyword = encodeURIComponent(keyword);
            const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=1&results=5&format=json`;
            
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
                        console.log('响应结构:', Object.keys(json));
                        
                        if (json.Error) {
                            console.log('❌ API错误:', json.Error);
                        } else {
                            console.log('📊 搜索统计:');
                            console.log(`   总结果数: ${json.totalResultsAvailable}`);
                            console.log(`   返回结果数: ${json.totalResultsReturned}`);
                            console.log(`   起始位置: ${json.firstResultsPosition}`);
                            
                            if (json.hits && json.hits.length > 0) {
                                console.log(`✅ 找到 ${json.hits.length} 个商品:`);
                                json.hits.slice(0, 3).forEach((hit, i) => {
                                    const item = hit.Item;
                                    if (item) {
                                        console.log(`   ${i+1}. ${item.Name.substring(0, 50)}...`);
                                        console.log(`      价格: ${item.Price}`);
                                    }
                                });
                            } else {
                                console.log('⚠️  无商品结果');
                                console.log('完整响应预览:', data.substring(0, 200));
                            }
                        }
                    } catch (error) {
                        console.log('❌ JSON解析失败:', error.message);
                        console.log('原始响应:', data.substring(0, 200));
                    }
                });
            }).on('error', (error) => {
                console.log('❌ HTTP请求失败:', error.message);
            });
            
        }, index * 3000);
    });
}

// 执行深度检查
deepCheckYahooAPI();