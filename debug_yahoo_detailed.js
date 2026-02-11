const http = require('http');

// 详细测试雅虎API集成问题
async function debugYahooIntegration() {
    console.log('🔍 详细调试雅虎API集成问题...\n');
    
    // 测试比价搜索，重点关注雅虎部分
    console.log('1️⃣ 详细测试比价搜索...');
    const postData = JSON.stringify({
        query: 'Nintendo Switch'
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
                console.log(`   ✅ 接收到响应，总长度: ${data.length} 字符`);
                
                if (jsonData.data && Array.isArray(jsonData.data)) {
                    console.log(`   📊 返回商品组数: ${jsonData.data.length}`);
                    
                    // 统计各平台商品
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
                    
                    console.log('\n   📈 详细平台统计:');
                    console.log(`      乐天市场 (10): ${platformStats.rakuten} 件商品`);
                    console.log(`      雅虎购物 (20): ${platformStats.yahoo} 件商品`);
                    console.log(`      Amazon (40): ${platformStats.amazon} 件商品`);
                    console.log(`      其他平台: ${platformStats.other} 件商品`);
                    console.log(`      总计: ${totalItems} 件商品`);
                    
                    // 如果没有雅虎商品，显示警告
                    if (platformStats.yahoo === 0) {
                        console.log('\n   ⚠️  警告: 雅虎搜索未返回任何商品!');
                        console.log('   可能原因:');
                        console.log('   1. 雅虎API配置不正确');
                        console.log('   2. 雅虎搜索功能被禁用');
                        console.log('   3. 雅虎API响应格式不符合预期');
                        console.log('   4. 网络连接问题');
                    }
                    
                    // 显示一些商品组作为示例
                    console.log('\n   📋 商品组示例 (最多5组):');
                    jsonData.data.slice(0, 5).forEach((group, index) => {
                        console.log(`      组${index + 1}: ${group.goodsName}`);
                        console.log(`         最低价: ¥${group.lowestPrice}`);
                        console.log(`         最低平台: ${group.lowestPlatform}`);
                        if (group.goodsList && group.goodsList.length > 0) {
                            const platforms = group.goodsList.map(g => 
                                g.mallType === 10 ? '乐天' : 
                                g.mallType === 20 ? '雅虎' : 
                                g.mallType === 40 ? 'Amazon' : `其他(${g.mallType})`
                            );
                            console.log(`         平台分布: ${[...new Set(platforms)].join(', ')}`);
                        }
                        console.log('');
                    });
                }
                
                console.log('🎯 调试完成!');
                
            } catch (error) {
                console.error('   ❌ 解析响应失败:', error.message);
                console.error('   原始响应前500字符:', data.substring(0, 500));
            }
        });
    });

    req.on('error', (error) => {
        console.error('   ❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
}

// 执行调试
debugYahooIntegration();