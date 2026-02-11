const http = require('http');

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
            console.log('📊 Nintendo Switch比价结果:');
            console.log('   总商品组数:', jsonData.data.length);
            
            let stats = {10:0, 20:0, 40:0};
            jsonData.data.forEach(group => {
                if (group.goodsList) {
                    group.goodsList.forEach(item => {
                        stats[item.mallType] = (stats[item.mallType] || 0) + 1;
                    });
                }
            });
            
            console.log('   平台分布:', stats);
            
            if (stats[20] > 0) {
                console.log('🎉 找到Yahoo商品!');
                // 显示一些Yahoo商品示例
                jsonData.data.forEach(group => {
                    if (group.goodsList) {
                        const yahooItems = group.goodsList.filter(item => item.mallType === 20);
                        if (yahooItems.length > 0) {
                            console.log(`\n📋 包含Yahoo商品的组: ${group.goodsName}`);
                            yahooItems.slice(0, 2).forEach((item, index) => {
                                console.log(`   ${index + 1}. ${item.goodsName.substring(0, 50)}...`);
                                console.log(`      价格: ¥${item.goodsPrice}`);
                            });
                        }
                    }
                });
            } else {
                console.log('❌ 仍无Yahoo商品');
                console.log('❓ 可能原因:');
                console.log('   1. 商品名称标准化后仍无法正确匹配');
                console.log('   2. Yahoo商品的价格或名称字段为空被过滤');
                console.log('   3. 分组逻辑需要进一步优化');
            }
            
        } catch (error) {
            console.error('解析失败:', error.message);
        }
    });
});

req.write(postData);
req.end();