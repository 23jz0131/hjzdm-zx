const http = require('http');

console.log('🔍 检查商品数据状态...\n');

// 测试不同的搜索关键词
const testQueries = ['iphone', 'switch', 'macbook'];

testQueries.forEach((query, index) => {
    setTimeout(() => {
        const postData = JSON.stringify({ query: query });
        
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
                    console.log(`📊 搜索 "${query}" 的结果:`);
                    console.log(`   响应码: ${jsonData.code}`);
                    console.log(`   数据项数: ${jsonData.data ? jsonData.data.length : 0}`);
                    
                    if (jsonData.data && jsonData.data.length > 0) {
                        console.log(`   ✅ 找到 ${jsonData.data.length} 个商品组`);
                        // 显示第一个商品组的信息
                        const firstGroup = jsonData.data[0];
                        console.log(`   第一组商品: ${firstGroup.goodsName}`);
                        console.log(`   包含商品数: ${firstGroup.goodsList ? firstGroup.goodsList.length : 0}`);
                        
                        // 统计平台分布
                        if (firstGroup.goodsList) {
                            let platformStats = {};
                            firstGroup.goodsList.forEach(item => {
                                const platform = item.mallType;
                                platformStats[platform] = (platformStats[platform] || 0) + 1;
                            });
                            console.log(`   平台分布:`, platformStats);
                        }
                    } else {
                        console.log(`   ❌ 未找到相关商品`);
                    }
                    console.log('');
                } catch (error) {
                    console.error(`   ❌ 解析失败: ${error.message}`);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`   ❌ 请求失败: ${error.message}`);
        });

        req.write(postData);
        req.end();
    }, index * 1000); // 间隔1秒执行
});