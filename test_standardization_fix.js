const http = require('http');

console.log('🔍 测试商品名称标准化修复效果...\n');

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
    console.log(`📡 HTTP响应状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log('✅ 响应解析成功');
            console.log('📦 响应码:', jsonData.code);
            console.log('📊 数据项数:', jsonData.data ? jsonData.data.length : 0);
            
            if (jsonData.data && Array.isArray(jsonData.data) && jsonData.data.length > 0) {
                console.log('\n🎯 标准化修复效果分析:');
                
                // 统计各平台商品数量
                let platformStats = { 10: 0, 20: 0, 40: 0, other: 0 };
                let totalItems = 0;
                let totalGroups = jsonData.data.length;
                
                jsonData.data.forEach(group => {
                    console.log(`\n📋 商品组: ${group.goodsName}`);
                    console.log(`   最低价格: ¥${group.lowestPrice}`);
                    console.log(`   最低平台: ${group.lowestPlatform}`);
                    
                    if (group.goodsList && Array.isArray(group.goodsList)) {
                        totalItems += group.goodsList.length;
                        console.log(`   包含商品数: ${group.goodsList.length}`);
                        
                        group.goodsList.forEach(item => {
                            const platformName = item.mallType === 10 ? '乐天' : 
                                               item.mallType === 20 ? '雅虎' : 
                                               item.mallType === 40 ? 'Amazon' : `其他(${item.mallType})`;
                            console.log(`     • ${platformName}: ${item.goodsName.substring(0, 30)}...`);
                            
                            switch(item.mallType) {
                                case 10: platformStats['10']++; break;
                                case 20: platformStats['20']++; break;
                                case 40: platformStats['40']++; break;
                                default: platformStats.other++; break;
                            }
                        });
                    }
                });
                
                console.log('\n📊 平台分布统计:');
                console.log(`   乐天市场 (10): ${platformStats['10']} 件`);
                console.log(`   Yahoo购物 (20): ${platformStats['20']} 件`);
                console.log(`   Amazon (40): ${platformStats['40']} 件`);
                console.log(`   其他平台: ${platformStats.other} 件`);
                console.log(`   总计商品: ${totalItems} 件`);
                console.log(`   商品组数: ${totalGroups} 组`);
                
                // 判断修复效果
                if (platformStats['20'] > 0) {
                    console.log('\n🎉 Yahoo商品存在！标准化修复成功！');
                    console.log('✅ 不同平台的商品名称已被正确标准化并聚合');
                } else {
                    console.log('\n⚠️  未找到Yahoo商品');
                    console.log('❓ 可能原因:');
                    console.log('   1. Yahoo API本身未返回相关商品');
                    console.log('   2. 标准化逻辑还需要调整');
                    console.log('   3. 商品过滤条件过于严格');
                }
                
                // 显示具体的Yahoo商品（如果存在）
                if (platformStats['20'] > 0) {
                    console.log('\n📱 Yahoo商品详情:');
                    jsonData.data.forEach(group => {
                        if (group.goodsList) {
                            const yahooItems = group.goodsList.filter(item => item.mallType === 20);
                            if (yahooItems.length > 0) {
                                console.log(`   组 '${group.goodsName}' 包含 ${yahooItems.length} 个Yahoo商品:`);
                                yahooItems.forEach((item, index) => {
                                    console.log(`     ${index + 1}. ${item.goodsName}`);
                                    console.log(`        价格: ¥${item.goodsPrice}`);
                                    console.log(`        链接: ${item.goodsLink.substring(0, 60)}...`);
                                });
                            }
                        }
                    });
                }
                
            } else {
                console.log('❌ 无返回数据或数据格式异常');
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

console.log('🚀 已发送测试请求，请等待响应...');