const https = require('https');

// 使用您提供的Yahoo API密钥进行测试
const clientId = 'dmVyPTIwMjUwNyZpZD1LUlpMQm80aVNUJmhhc2g9TVdJME1ERTRNVFJrTkdJMk1ESmpaQQ';
const keyword = 'Switch';
const encodedKeyword = encodeURIComponent(keyword);
const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${clientId}&query=${encodedKeyword}&start=1&results=5&format=json`;

console.log('🔍 测试Yahoo API连接...');
console.log('使用的Client ID:', clientId);
console.log('搜索关键词:', keyword);
console.log('完整URL:', url);

https.get(url, (res) => {
    console.log('📡 响应状态码:', res.statusCode);
    console.log('响应头:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('\n=== Yahoo API 响应 ===');
            
            if (json.Error) {
                console.log('❌ API错误:', json.Error);
                if (json.Error.Message) {
                    console.log('错误信息:', json.Error.Message);
                }
            } else if (json.hits) {
                console.log('✅ API调用成功!');
                console.log('找到商品数量:', json.hits.length);
                console.log('总结果数:', json.totalResultsAvailable);
                
                if (json.hits.length > 0) {
                    console.log('\n📦 前3个商品详情:');
                    json.hits.slice(0, 3).forEach((hit, index) => {
                        const item = hit.Item;
                        if (item) {
                            console.log(`${index + 1}. ${item.Name}`);
                            console.log(`   价格: ${item.Price}`);
                            console.log(`   链接: ${item.Url}`);
                            console.log(`   图片: ${item.Image ? '有' : '无'}`);
                            console.log('');
                        }
                    });
                    
                    console.log('🎉 Yahoo API配置成功，可以获取真实商品数据！');
                }
            } else {
                console.log('⚠️  响应格式异常:', Object.keys(json));
            }
        } catch (error) {
            console.log('❌ JSON解析失败:', error.message);
            console.log('原始响应:', data.substring(0, 200));
        }
    });
}).on('error', (error) => {
    console.log('❌ HTTP请求失败:', error.message);
});