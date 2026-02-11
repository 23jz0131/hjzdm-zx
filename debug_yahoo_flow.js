const http = require('http');

console.log('🔍 开始调试Yahoo搜索流程...\n');

// 测试1: /goods/compare 接口
function testCompareAPI() {
    console.log('1️⃣ 测试 /goods/compare 接口');
    
    const postData = JSON.stringify({
        query: 'Yahoo 测试商品'
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
                console.log('   ✅ /goods/compare 响应接收成功');
                
                if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
                    const group = jsonData.data[0];
                    console.log(`   📦 商品组: ${group.goodsName}`);
                    console.log(`   💰 最低价格: ¥${group.lowestPrice}`);
                    console.log(`   🏪 最低平台: ${group.lowestPlatform}`);
                    
                    // 统计各平台商品数量
                    const platformStats = { 10: 0, 20: 0, 30: 0, other: 0 };
                    let totalItems = 0;
                    
                    if (group.goodsList && Array.isArray(group.goodsList)) {
                        totalItems = group.goodsList.length;
                        group.goodsList.forEach(item => {
                            switch(item.mallType) {
                                case 10: platformStats['10']++; break;
                                case 20: platformStats['20']++; break;
                                case 30: platformStats['30']++; break;
                                default: platformStats.other++; break;
                            }
                        });
                    }
                    
                    console.log('\n   📊 平台分布统计:');
                    console.log(`      乐天市场 (10): ${platformStats['10']} 件`);
                    console.log(`      Yahoo购物 (20): ${platformStats['20']} 件`);
                    console.log(`      淘宝 (30): ${platformStats['30']} 件`);
                    console.log(`      其他平台: ${platformStats.other} 件`);
                    console.log(`      总计: ${totalItems} 件`);
                    
                    if (platformStats['20'] > 0) {
                        console.log('   🎉 Yahoo商品存在！');
                    } else {
                        console.log('   ⚠️  未找到Yahoo商品');
                    }
                }
                
                // 继续测试下一个接口
                setTimeout(testSearchAPI, 1000);
                
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

// 测试2: /goods/search 接口
function testSearchAPI() {
    console.log('\n2️⃣ 测试 /goods/search 接口');
    
    const postData = JSON.stringify({
        query: 'Yahoo 测试商品'
    });

    const options = {
        hostname: 'localhost',
        port: 9090,
        path: '/goods/search',
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
                console.log('   ✅ /goods/search 响应接收成功');
                
                if (jsonData.data && Array.isArray(jsonData.data)) {
                    console.log(`   📦 返回商品数量: ${jsonData.data.length}`);
                    
                    // 统计各平台商品数量
                    const platformStats = { 10: 0, 20: 0, 30: 0, other: 0 };
                    
                    jsonData.data.forEach(item => {
                        switch(item.mallType) {
                            case 10: platformStats['10']++; break;
                            case 20: platformStats['20']++; break;
                            case 30: platformStats['30']++; break;
                            default: platformStats.other++; break;
                        }
                    });
                    
                    console.log('\n   📊 平台分布统计:');
                    console.log(`      乐天市场 (10): ${platformStats['10']} 件`);
                    console.log(`      Yahoo购物 (20): ${platformStats['20']} 件`);
                    console.log(`      淘宝 (30): ${platformStats['30']} 件`);
                    console.log(`      其他平台: ${platformStats.other} 件`);
                    
                    if (platformStats['20'] > 0) {
                        console.log('   🎉 Yahoo商品存在！');
                        // 显示Yahoo商品详情
                        const yahooItems = jsonData.data.filter(item => item.mallType === 20);
                        console.log('\n   📋 Yahoo商品详情:');
                        yahooItems.forEach((item, index) => {
                            console.log(`      ${index + 1}. ${item.goodsName} - ¥${item.goodsPrice}`);
                        });
                    } else {
                        console.log('   ⚠️  未找到Yahoo商品');
                    }
                }
                
                console.log('\n🎯 调试完成！请检查:');
                console.log('   1. 后端控制台是否显示平台分布日志');
                console.log('   2. 前端控制台是否显示ComparePage的mallType日志');
                console.log('   3. 前端页面是否正确渲染Yahoo商品');
                
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

// 开始测试
testCompareAPI();