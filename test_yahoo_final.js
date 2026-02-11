const http = require('http');

console.log('🔍 专门测试Yahoo搜索执行情况...\n');

function testYahooExecution() {
    console.log('🚀 发送测试请求到 /goods/compare');
    
    const postData = JSON.stringify({
        query: 'test execution'
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
        console.log(`   📡 HTTP响应状态码: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('   ✅ 响应解析成功');
                console.log('   📦 响应码:', jsonData.code);
                console.log('   📊 数据项数:', jsonData.data ? jsonData.data.length : 0);
                
                if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
                    const group = jsonData.data[0];
                    console.log(`   🛒 第一个商品组: ${group.goodsName}`);
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
                        console.log('   🎉 Yahoo商品存在！');
                    } else {
                        console.log('   ⚠️  未找到Yahoo商品');
                        console.log('   ❓ 这表明Yahoo搜索可能没有被执行');
                    }
                }
                
            } catch (error) {
                console.error('   ❌ 解析响应失败:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('   ❌ 请求失败:', error.message);
    });

    req.write(postData);
    req.end();
    
    // 等待几秒后提醒用户检查后端日志
    setTimeout(() => {
        console.log('\n📋 请立即检查后端日志，寻找以下关键字:');
        console.log('   - "Yahoo Enabled 状态: true"');
        console.log('   - "Yahoo搜索条件满足，准备执行搜索"'); 
        console.log('   - "Yahoo 商品検索を開始"');
        console.log('   - "Yahoo API 请求URL:"');
        console.log('   - "Yahoo API 响应长度:"');
        console.log('   - "添加Yahoo商品:"');
    }, 2000);
}

// 执行测试
testYahooExecution();