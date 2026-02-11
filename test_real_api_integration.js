const http = require('http');

console.log('🔍 测试真实的电商API集成...\n');

function testRealApiIntegration() {
    console.log('🚀 测试真实API商品搜索');
    
    const postData = JSON.stringify({
        query: 'iPhone'  // 使用常见的搜索词
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
                console.log('📊 响应码:', jsonData.code);
                console.log('📈 返回数据项数:', jsonData.data ? jsonData.data.length : 0);
                
                if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
                    const group = jsonData.data[0];
                    console.log(`\n🛒 第一个商品组: ${group.goodsName}`);
                    console.log(`💰 最低价格: ¥${group.lowestPrice}`);
                    console.log(`🏪 最低平台: ${group.lowestPlatform}`);
                    
                    // 统计各平台商品数量
                    const platformStats = { 10: 0, 20: 0, other: 0 };
                    let totalItems = 0;
                    
                    if (group.goodsList && Array.isArray(group.goodsList)) {
                        totalItems = group.goodsList.length;
                        group.goodsList.forEach(item => {
                            switch(item.mallType) {
                                case 10: platformStats['10']++; break;
                                case 20: platformStats['20']++; break;
                                default: platformStats.other++; break;
                            }
                        });
                        
                        console.log('\n📊 平台分布统计:');
                        console.log(`   乐天市场 (10): ${platformStats['10']} 件`);
                        console.log(`   Yahoo购物 (20): ${platformStats['20']} 件`);
                        console.log(`   其他平台: ${platformStats.other} 件`);
                        console.log(`   总计: ${totalItems} 件`);
                        
                        // 显示一些商品详情
                        console.log('\n📋 商品详情示例:');
                        group.goodsList.slice(0, 3).forEach((item, index) => {
                            console.log(`   ${index + 1}. ${item.goodsName.substring(0, 50)}...`);
                            console.log(`      价格: ¥${item.goodsPrice}`);
                            console.log(`      平台: ${item.mallType === 10 ? '乐天' : item.mallType === 20 ? 'Yahoo' : '其他'}`);
                            console.log(`      链接: ${item.goodsLink.substring(0, 60)}...`);
                            console.log('');
                        });
                        
                        if (platformStats['10'] > 0 && platformStats['20'] > 0) {
                            console.log('🎉 成功！真实API集成工作正常，同时获取到了乐天和Yahoo的商品数据！');
                        } else if (platformStats['10'] > 0 || platformStats['20'] > 0) {
                            console.log('✅ 部分成功！至少有一个平台的API工作正常');
                        } else {
                            console.log('⚠️  API调用可能存在问题，未获取到预期的商品数据');
                        }
                    }
                } else {
                    console.log('❌ 未返回有效的商品数据');
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
testRealApiIntegration();