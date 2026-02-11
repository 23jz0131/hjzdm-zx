const http = require('http');

console.log('🔍 测试真实后端的Yahoo搜索功能...\n');

function testRealBackend() {
    console.log('🚀 测试真实后端 /goods/compare 接口');
    
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
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('   ✅ 真实后端响应接收成功');
                console.log('   📦 响应码:', jsonData.code);
                
                if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
                    const group = jsonData.data[0];
                    console.log(`   🛒 商品组: ${group.goodsName}`);
                    console.log(`   💰 最低价格: ¥${group.lowestPrice}`);
                    console.log(`   🏪 最低平台: ${group.lowestPlatform}`);
                    
                    // 统计各平台商品数量
                    const platformStats = { 10: 0, 20: 0, 40: 0, other: 0 };
                    let totalItems = 0;
                    
                    if (group.goodsList && Array.isArray(group.goodsList)) {
                        totalItems = group.goodsList.length;
                        group.goodsList.forEach(item => {
                            switch(item.mallType) {
                                case 10: platformStats['10']++; break;
                                case 20: platformStats['20']++; break;
                                case 40: platformStats['40']++; break;
                                default: platformStats.other++; break;
                            }
                        });
                    }
                    
                    console.log('\n   📊 平台分布统计:');
                    console.log(`      乐天市场 (10): ${platformStats['10']} 件`);
                    console.log(`      Yahoo购物 (20): ${platformStats['20']} 件`);
                    console.log(`      Amazon (40): ${platformStats['40']} 件`);
                    console.log(`      其他平台: ${platformStats.other} 件`);
                    console.log(`      总计: ${totalItems} 件`);
                    
                    if (platformStats['20'] > 0) {
                        console.log('   🎉 Yahoo商品存在！真实Yahoo API正在工作！');
                        // 显示Yahoo商品详情
                        const yahooItems = group.goodsList.filter(item => item.mallType === 20);
                        console.log('\n   📋 Yahoo商品详情:');
                        yahooItems.forEach((item, index) => {
                            console.log(`      ${index + 1}. ${item.goodsName}`);
                            console.log(`         价格: ¥${item.goodsPrice}`);
                            console.log(`         链接: ${item.goodsLink}`);
                            console.log('');
                        });
                    } else {
                        console.log('   ⚠️  未找到Yahoo商品 - 可能需要检查Yahoo API配置');
                    }
                } else {
                    console.log('   ⚠️  响应数据为空或格式不符');
                }
                
                console.log('\n🎯 测试完成！');
                console.log('💡 现在您可以:');
                console.log('   1. 在浏览器中访问 http://localhost:3000');
                console.log('   2. 进入比价页面');
                console.log('   3. 搜索商品查看真实Yahoo数据');
                
            } catch (error) {
                console.error('   ❌ 解析响应失败:', error.message);
                console.error('   原始响应:', data.substring(0, 200));
            }
        });
    });

    req.on('error', (error) => {
        console.error('   ❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
}

// 执行测试
testRealBackend();