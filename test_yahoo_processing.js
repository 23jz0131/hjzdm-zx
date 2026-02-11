const http = require('http');

console.log('🔍 验证Yahoo商品处理流程...\n');

function testYahooProcessingFlow() {
    console.log('🚀 测试Yahoo商品处理流程');
    
    const postData = JSON.stringify({
        query: 'iPhone'  // 使用之前验证过有结果的关键词
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
        console.log(`📡 HTTP响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📦 响应解析成功');
                console.log('📊 返回数据项数:', jsonData.data ? jsonData.data.length : 0);
                
                if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
                    const group = jsonData.data[0];
                    console.log(`\n🛒 第一个商品组: ${group.goodsName}`);
                    console.log(`💰 最低价格: ¥${group.lowestPrice}`);
                    console.log(`🏪 最低平台: ${group.lowestPlatform}`);
                    
                    // 详细统计各平台商品
                    const platformStats = { 10: 0, 20: 0, 40: 0, other: 0 };
                    let totalItems = 0;
                    let yahooItems = [];
                    
                    if (group.goodsList && Array.isArray(group.goodsList)) {
                        totalItems = group.goodsList.length;
                        group.goodsList.forEach(item => {
                            switch(item.mallType) {
                                case 10: platformStats['10']++; break;
                                case 20: 
                                    platformStats['20']++; 
                                    yahooItems.push(item);
                                    break;
                                case 40: platformStats['40']++; break;
                                default: platformStats.other++; break;
                            }
                        });
                    }
                    
                    console.log('\n📈 详细平台分布:');
                    console.log(`   乐天市场 (10): ${platformStats['10']} 件`);
                    console.log(`   Yahoo购物 (20): ${platformStats['20']} 件`);
                    console.log(`   Amazon (40): ${platformStats['40']} 件`);
                    console.log(`   其他平台: ${platformStats.other} 件`);
                    console.log(`   总计: ${totalItems} 件`);
                    
                    if (platformStats['20'] > 0) {
                        console.log('\n🎉 Yahoo商品处理成功！');
                        console.log('📋 Yahoo商品详情:');
                        yahooItems.slice(0, 3).forEach((item, index) => {
                            console.log(`   ${index + 1}. ${item.goodsName.substring(0, 50)}...`);
                            console.log(`      价格: ¥${item.goodsPrice}`);
                            console.log(`      链接: ${item.goodsLink.substring(0, 80)}...`);
                            console.log('');
                        });
                    } else {
                        console.log('\n❌ Yahoo商品处理失败');
                        console.log('❓ 可能的原因:');
                        console.log('   1. Yahoo API响应解析问题');
                        console.log('   2. 商品过滤条件过于严格');
                        console.log('   3. 价格或名称字段为空被过滤');
                        console.log('   4. 商品添加逻辑有问题');
                    }
                } else {
                    console.log('❌ 无返回数据');
                }
                
            } catch (error) {
                console.error('❌ 解析响应失败:', error.message);
                console.log('原始响应:', data.substring(0, 200));
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
}

// 执行测试
testYahooProcessingFlow();