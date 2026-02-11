const http = require('http');

console.log('🔍 用合适的关键词测试Yahoo搜索...\n');

function testWithGoodKeywords() {
    console.log('🚀 测试常见商品关键词');
    
    const testKeywords = ['iPhone', 'Switch', 'カメラ'];
    
    testKeywords.forEach((keyword, index) => {
        setTimeout(() => {
            console.log(`\n--- 测试关键词: "${keyword}" ---`);
            
            const postData = JSON.stringify({
                query: keyword
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

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`   📦 返回商品组数: ${jsonData.data ? jsonData.data.length : 0}`);
                        
                        if (jsonData.data && jsonData.data.length > 0) {
                            const group = jsonData.data[0];
                            // 统计各平台商品数量
                            const platformStats = { 10: 0, 20: 0, 40: 0, other: 0 };
                            
                            if (group.goodsList && Array.isArray(group.goodsList)) {
                                group.goodsList.forEach(item => {
                                    switch(item.mallType) {
                                        case 10: platformStats['10']++; break;
                                        case 20: platformStats['20']++; break;
                                        case 40: platformStats['40']++; break;
                                        default: platformStats.other++; break;
                                    }
                                });
                            }
                            
                            console.log(`   📊 平台分布: 乐天(${platformStats['10']}) Yahoo(${platformStats['20']}) Amazon(${platformStats['40']})`);
                            
                            if (platformStats['20'] > 0) {
                                console.log('   🎉 找到Yahoo商品！');
                            } else {
                                console.log('   ⚠️  该关键词下无Yahoo商品');
                            }
                        }
                    } catch (error) {
                        console.error('   ❌ 解析失败:', error.message);
                    }
                });
            });

            req.on('error', (error) => {
                console.error('   ❌ 请求失败:', error.message);
            });

            req.write(postData);
            req.end();
            
        }, index * 2000); // 每个测试间隔2秒
    });
}

// 执行测试
testWithGoodKeywords();