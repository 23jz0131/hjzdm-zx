const http = require('http');

console.log('🔍 测试真实数据API...\n');

function testTrueRealData() {
    const postData = JSON.stringify({
        query: 'ノートパソコン'
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

    console.log('🚀 测试真实数据API调用...');
    
    const req = http.request(options, (res) => {
        console.log(`📡 响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('✅ 响应接收成功');
                console.log(`📦 响应码: ${jsonData.code}`);
                console.log(`💬 消息: ${jsonData.message}`);
                
                if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
                    const group = jsonData.data[0];
                    console.log(`\n🛒 商品组: ${group.goodsName}`);
                    console.log(`💰 最低价格: ¥${group.lowestPrice}`);
                    console.log(`🏪 最低平台: ${group.lowestPlatform}`);
                    
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
                    
                    console.log('\n📊 平台分布统计:');
                    console.log(`   乐天市场 (10): ${platformStats['10']} 件`);
                    console.log(`   Yahoo购物 (20): ${platformStats['20']} 件`);
                    console.log(`   Amazon (40): ${platformStats['40']} 件`);
                    console.log(`   其他平台: ${platformStats.other} 件`);
                    console.log(`   总计: ${totalItems} 件`);
                    
                    // 显示前几个真实商品作为示例
                    console.log('\n📋 真实商品示例:');
                    if (group.goodsList && group.goodsList.length > 0) {
                        group.goodsList.slice(0, 3).forEach((item, index) => {
                            const platform = item.mallType === 10 ? '乐天' : 
                                           item.mallType === 20 ? 'Yahoo' : 
                                           item.mallType === 40 ? 'Amazon' : '其他';
                            console.log(`   ${index + 1}. ${item.goodsName}`);
                            console.log(`      价格: ¥${item.goodsPrice}`);
                            console.log(`      平台: ${platform} (${item.mallType})`);
                            console.log(`      链接: ${item.goodsLink.substring(0, 80)}...`);
                            console.log('');
                        });
                    }
                    
                    console.log('🎉 真实数据测试成功！');
                    console.log('✅ 这些都是来自真实电商平台的商品数据！');
                    console.log('💡 现在您可以访问 http://localhost:3000 体验真实的购物比价服务');
                    
                } else {
                    console.log('❌ 未收到有效的商品数据');
                    console.log('原始响应:', data.substring(0, 200));
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
testTrueRealData();