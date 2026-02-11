const http = require('http');

// 测试雅虎API集成
async function testYahooIntegration() {
    console.log('🚀 开始测试雅虎API集成...\n');
    
    // 测试1: 商品比价搜索
    console.log('1️⃣ 测试商品比价搜索 (包含雅虎)...');
    const postData = JSON.stringify({
        query: 'iPhone'
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
        console.log(`   📡 响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log(`   ✅ 成功接收响应，数据长度: ${data.length} 字符`);
                
                if (jsonData.data && Array.isArray(jsonData.data)) {
                    console.log(`   📊 返回商品组数: ${jsonData.data.length}`);
                    
                    // 统计各平台商品数量
                    let platformStats = { rakuten: 0, yahoo: 0, amazon: 0, other: 0 };
                    let totalItems = 0;
                    
                    jsonData.data.forEach(group => {
                        if (group.goodsList && Array.isArray(group.goodsList)) {
                            group.goodsList.forEach(item => {
                                totalItems++;
                                switch(item.mallType) {
                                    case 10: platformStats.rakuten++; break;
                                    case 20: platformStats.yahoo++; break;
                                    case 40: platformStats.amazon++; break;
                                    default: platformStats.other++; break;
                                }
                            });
                        }
                    });
                    
                    console.log('\n   📈 平台统计:');
                    console.log(`      乐天市场 (10): ${platformStats.rakuten} 件商品`);
                    console.log(`      雅虎购物 (20): ${platformStats.yahoo} 件商品`);
                    console.log(`      Amazon (40): ${platformStats.amazon} 件商品`);
                    console.log(`      其他平台: ${platformStats.other} 件商品`);
                    console.log(`      总计: ${totalItems} 件商品`);
                    
                    // 显示前几个商品组作为示例
                    console.log('\n   📋 示例商品组:');
                    jsonData.data.slice(0, 3).forEach((group, index) => {
                        console.log(`      组${index + 1}: ${group.goodsName}`);
                        console.log(`         最低价: ¥${group.lowestPrice}`);
                        console.log(`         最低平台: ${group.lowestPlatform}`);
                        if (group.goodsList && group.goodsList.length > 0) {
                            console.log(`         平台分布: ${group.goodsList.map(g => 
                                g.mallType === 10 ? '乐天' : 
                                g.mallType === 20 ? '雅虎' : 
                                g.mallType === 40 ? 'Amazon' : `其他(${g.mallType})`
                            ).join(', ')}`);
                        }
                        console.log('');
                    });
                } else {
                    console.log('   ⚠️ 响应格式不符合预期');
                    console.log('   原始响应:', data.substring(0, 200) + '...');
                }
                
                // 测试2: 单独测试雅虎搜索
                console.log('2️⃣ 单独测试雅虎搜索...');
                testYahooOnly();
                
            } catch (error) {
                console.error('   ❌ 解析响应失败:', error.message);
                console.error('   原始响应:', data.substring(0, 200) + '...');
            }
        });
    });

    req.on('error', (error) => {
        console.error('   ❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
}

// 单独测试雅虎搜索
function testYahooOnly() {
    const yahooData = JSON.stringify({
        query: 'Nintendo Switch',
        page: 1
    });

    const yahooOptions = {
        hostname: 'localhost',
        port: 9090,
        path: '/goods/search/yahoo',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(yahooData)
        }
    };

    const yahooReq = http.request(yahooOptions, (res) => {
        console.log(`   📡 雅虎单独搜索响应状态: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log(`   ✅ 雅虎搜索完成，返回 ${jsonData.data ? jsonData.data.length : 0} 件商品`);
                
                if (jsonData.data && jsonData.data.length > 0) {
                    console.log('   📋 雅虎商品示例:');
                    jsonData.data.slice(0, 3).forEach((item, index) => {
                        console.log(`      ${index + 1}. ${item.goodsName}`);
                        console.log(`         价格: ¥${item.goodsPrice}`);
                        console.log(`         链接: ${item.goodsLink ? item.goodsLink.substring(0, 50) + '...' : '无'}`);
                        console.log('');
                    });
                } else {
                    console.log('   ⚠️ 雅虎搜索未返回商品');
                }
                
                console.log('🎉 雅虎API集成测试完成!');
                
            } catch (error) {
                console.error('   ❌ 解析雅虎响应失败:', error.message);
            }
        });
    });

    yahooReq.on('error', (error) => {
        console.error('   ❌ 雅虎请求失败:', error.message);
    });

    yahooReq.write(yahooData);
    yahooReq.end();
}

// 执行测试
testYahooIntegration();