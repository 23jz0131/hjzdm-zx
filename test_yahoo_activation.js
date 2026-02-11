const http = require('http');

console.log('🔍 专门测试Yahoo搜索是否被启用...\n');

function testYahooActivation() {
    console.log('🚀 发送测试请求到 /goods/compare');
    
    const postData = JSON.stringify({
        query: 'Switch'
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
                    // 统计各平台商品数量
                    let platformStats = { 10: 0, 20: 0, 40: 0, other: 0 };
                    let totalItems = 0;
                    
                    jsonData.data.forEach(group => {
                        if (group.goodsList && Array.isArray(group.goodsList)) {
                            group.goodsList.forEach(item => {
                                switch(item.mallType) {
                                    case 10: platformStats['10']++; break;
                                    case 20: platformStats['20']++; break;
                                    case 40: platformStats['40']++; break;
                                    default: platformStats.other++; break;
                                }
                                totalItems++;
                            });
                        }
                    });
                    
                    console.log('\n   📊 平台分布统计:');
                    console.log(`      乐天市场 (10): ${platformStats['10']} 件`);
                    console.log(`      Yahoo购物 (20): ${platformStats['20']} 件`);
                    console.log(`      Amazon (40): ${platformStats['40']} 件`);
                    console.log(`      其他平台: ${platformStats.other} 件`);
                    console.log(`      总计: ${totalItems} 件`);
                    
                    if (platformStats['20'] > 0) {
                        console.log('   🎉 Yahoo商品存在！搜索功能已启用！');
                    } else {
                        console.log('   ⚠️  未找到Yahoo商品 - 搜索功能可能仍未启用');
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
}

// 执行测试
testYahooActivation();