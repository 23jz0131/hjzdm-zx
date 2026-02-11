const http = require('http');

console.log('🔍 详细测试真实API调用过程...\n');

function detailedApiTest() {
    console.log('🚀 发送详细的商品搜索请求');
    
    const postData = JSON.stringify({
        query: 'Nintendo Switch'  // 使用另一个常见关键词
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
                    console.log(`\n🛒 商品组: ${group.goodsName}`);
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
                        
                        // 显示商品详情
                        console.log('\n📋 商品详情:');
                        group.goodsList.forEach((item, index) => {
                            console.log(`${index + 1}. ${item.goodsName.substring(0, 60)}...`);
                            console.log(`   价格: ¥${item.goodsPrice}`);
                            console.log(`   平台: ${item.mallType === 10 ? '乐天' : item.mallType === 20 ? 'Yahoo' : '其他'} (${item.mallType})`);
                            console.log(`   链接: ${item.goodsLink}`);
                            console.log('');
                        });
                        
                        // 判断结果
                        if (platformStats['10'] > 0 && platformStats['20'] > 0) {
                            console.log('🎉 完美！两个平台的API都工作正常');
                        } else if (platformStats['10'] > 0) {
                            console.log('✅ 乐天API工作正常，Yahoo API可能需要检查配置');
                        } else if (platformStats['20'] > 0) {
                            console.log('✅ Yahoo API工作正常，乐天API可能需要检查配置');
                        } else {
                            console.log('⚠️  API调用可能存在问题');
                        }
                    }
                } else {
                    console.log('❌ 未返回有效的商品数据');
                }
                
            } catch (error) {
                console.error('❌ 解析响应失败:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
    
    // 等待几秒后提示检查后端日志
    setTimeout(() => {
        console.log('\n📋 请检查后端日志，应该能看到:');
        console.log('   - "开始商品比价搜索"');
        console.log('   - "搜索关键词: Nintendo Switch"');
        console.log('   - "开始乐天商品搜索..."');
        console.log('   - "乐天搜索返回 X 个商品"');
        console.log('   - "开始Yahoo商品搜索..."');
        console.log('   - "Yahoo搜索返回 X 个商品"');
        console.log('   - "总共获取商品数量: X"');
    }, 2000);
}

// 执行详细测试
detailedApiTest();